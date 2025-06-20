import {logger} from '@shared/services/logger.shared';

import {ACCOUNT_EXPERIMENTS_DB_COLLECTION} from '@shared/lib/constants.shared';
import {prefixError} from '@shared/lib/errorUtils.shared';
import {
  getExperimentsForAccount,
  makeBooleanExperimentOverride,
  makeDefaultAccountExperimentsState,
  makeStringExperimentOverride,
} from '@shared/lib/experiments.shared';

import {parseAccountId} from '@shared/parsers/accounts.parser';
import {parseAccountExperimentsState} from '@shared/parsers/experiments.parser';

import type {AccountId} from '@shared/types/accounts.types';
import type {ClientEnvironment} from '@shared/types/environment.types';
import type {
  AccountExperiment,
  AccountExperimentsState,
  ExperimentId,
} from '@shared/types/experiments.types';
import type {AsyncResult} from '@shared/types/results.types';
import type {Consumer, Unsubscribe} from '@shared/types/utils.types';

import type {AccountExperimentsStateFromStorage} from '@shared/schemas/experiments.schema';
import {toStorageAccountExperimentsState} from '@shared/storage/experiments.storage';

import type {ClientEventLogService} from '@sharedClient/services/eventLog.client';
import type {ClientFirebaseService} from '@sharedClient/services/firebase.client';
import {makeClientFirestoreCollectionService} from '@sharedClient/services/firestore.client';
import type {ClientFirestoreCollectionService} from '@sharedClient/services/firestore.client';

type ClientAccountExperimentsCollectionService = ClientFirestoreCollectionService<
  AccountId,
  AccountExperimentsState,
  AccountExperimentsStateFromStorage
>;

export class ClientExperimentsService {
  private readonly environment: ClientEnvironment;
  private readonly accountId: AccountId;
  private readonly unsubscribeWatcher: Unsubscribe;
  private readonly isInternalAccount: boolean;
  private readonly eventLogService: ClientEventLogService;
  private accountExperimentsState: AccountExperimentsState | null = null;
  private readonly collectionService: ClientAccountExperimentsCollectionService;

  constructor(args: {
    readonly accountId: AccountId;
    readonly isInternalAccount: boolean;
    readonly environment: ClientEnvironment;
    readonly eventLogService: ClientEventLogService;
    readonly firebaseService: ClientFirebaseService;
  }) {
    this.accountId = args.accountId;
    this.isInternalAccount = args.isInternalAccount;
    this.environment = args.environment;
    this.eventLogService = args.eventLogService;

    this.collectionService = makeClientFirestoreCollectionService({
      firebaseService: args.firebaseService,
      collectionPath: ACCOUNT_EXPERIMENTS_DB_COLLECTION,
      toStorage: toStorageAccountExperimentsState,
      fromStorage: parseAccountExperimentsState,
      parseId: parseAccountId,
    });

    this.unsubscribeWatcher = this.watchAccountExperimentsStateDoc({
      onData: (accountExperimentsState) => {
        this.accountExperimentsState = accountExperimentsState;
      },
      onError: (error) => {
        const message =
          'Failed to fetch account experiments state. Using default experiment values.';
        logger.error(prefixError(error, message));
        this.accountExperimentsState = makeDefaultAccountExperimentsState({
          accountId: this.accountId,
          isInternalAccount: this.isInternalAccount,
        });
      },
    });
  }

  public destroy(): void {
    this.unsubscribeWatcher();
  }

  private watchAccountExperimentsStateDoc(args: {
    readonly onData: Consumer<AccountExperimentsState>;
    readonly onError: Consumer<Error>;
  }): Unsubscribe {
    const {onData, onError} = args;

    // If the account experiments state is already set, call the callback with the current state.
    if (this.accountExperimentsState) {
      onData(this.accountExperimentsState);
    }

    return this.collectionService.watchDoc(
      this.accountId,
      (accountExperimentsState) => {
        if (!accountExperimentsState) {
          // If no account experiments state is found, assume default state.
          onData(
            makeDefaultAccountExperimentsState({
              accountId: this.accountId,
              isInternalAccount: this.isInternalAccount,
            })
          );
          return;
        }

        onData({
          accountId: this.accountId,
          accountVisibility: accountExperimentsState.accountVisibility,
          experimentOverrides: accountExperimentsState.experimentOverrides,
          createdTime: accountExperimentsState.createdTime,
          lastUpdatedTime: accountExperimentsState.lastUpdatedTime,
        });
      },
      onError
    );
  }

  public watchExperimentsForAccount(args: {
    readonly onData: Consumer<readonly AccountExperiment[]>;
    readonly onError: Consumer<Error>;
  }): Unsubscribe {
    const {onData, onError} = args;

    return this.watchAccountExperimentsStateDoc({
      onData: (accountExperimentsState) => {
        const accountExperiments = getExperimentsForAccount({
          environment: this.environment,
          accountVisibility: accountExperimentsState.accountVisibility,
          accountOverrides: accountExperimentsState.experimentOverrides,
        });
        onData(accountExperiments);
      },
      onError,
    });
  }

  public async setIsExperimentEnabled(args: {
    readonly experimentId: ExperimentId;
    readonly isEnabled: boolean;
  }): AsyncResult<void, Error> {
    const {experimentId, isEnabled} = args;

    const pathToUpdate = `experimentOverrides.${experimentId}`;
    const experimentOverride = makeBooleanExperimentOverride({experimentId, isEnabled});

    const updateResult = await this.collectionService.updateDoc(this.accountId, {
      [pathToUpdate]: experimentOverride,
    });

    if (!updateResult.success) return updateResult;

    if (isEnabled) {
      void this.eventLogService.logExperimentEnabledEvent({
        experimentId,
        experimentType: experimentOverride.experimentType,
      });
    } else {
      void this.eventLogService.logExperimentDisabledEvent({
        experimentId,
        experimentType: experimentOverride.experimentType,
      });
    }

    return updateResult;
  }

  public async setStringExperimentValue(args: {
    readonly accountExperiment: AccountExperiment;
    readonly value: string;
  }): AsyncResult<void, Error> {
    const {accountExperiment, value} = args;
    const {experimentId} = accountExperiment.definition;

    const pathToUpdate = `experimentOverrides.${experimentId}`;
    const experimentOverride = makeStringExperimentOverride({
      experimentId,
      isEnabled: true,
      value,
    });

    const updateResult = await this.collectionService.updateDoc(this.accountId, {
      [pathToUpdate]: experimentOverride,
    });

    if (!updateResult.success) return updateResult;

    void this.eventLogService.logStringExperimentValueChangedEvent({experimentId, value});

    return updateResult;
  }
}
