import {useMemo} from 'react';

import {logger} from '@shared/services/logger.shared';

import {ACCOUNT_EXPERIMENTS_DB_COLLECTION} from '@shared/lib/constants.shared';
import {prefixError, prefixResultIfError} from '@shared/lib/errorUtils.shared';
import {ALL_EXPERIMENT_DEFINITIONS} from '@shared/lib/experimentDefinitions.shared';
import {
  getExperimentsForAccount,
  makeAccountExperimentWithEmptyValue,
  makeBooleanExperimentOverride,
  makeDefaultAccountExperimentsState,
  makeStringExperimentOverride,
} from '@shared/lib/experiments.shared';

import {parseAccountId} from '@shared/parsers/accounts.parser';
import {
  parseAccountExperimentsState,
  toStorageAccountExperimentsState,
} from '@shared/parsers/experiments.parser';

import type {AccountId} from '@shared/types/accounts.types';
import type {ClientEnvironment} from '@shared/types/environment.types';
import type {
  AccountExperiment,
  AccountExperimentsState,
  ExperimentId,
} from '@shared/types/experiments.types';
import type {AsyncResult} from '@shared/types/results.types';
import type {Consumer, Unsubscribe} from '@shared/types/utils.types';

import {
  ClientFirestoreCollectionService,
  makeFirestoreDataConverter,
} from '@sharedClient/services/firestore.client';

export class ClientExperimentsService {
  private readonly environment: ClientEnvironment;
  private readonly accountExperimentsCollectionService: ClientAccountExperimentsCollectionService;
  private readonly accountId: AccountId;
  private readonly unsubscribeWatcher: Unsubscribe;
  private readonly isInternalAccount: boolean;
  private accountExperimentsState: AccountExperimentsState | null = null;

  constructor(args: {
    readonly accountId: AccountId;
    readonly isInternalAccount: boolean;
    readonly environment: ClientEnvironment;
    readonly accountExperimentsCollectionService: ClientAccountExperimentsCollectionService;
  }) {
    this.accountId = args.accountId;
    this.isInternalAccount = args.isInternalAccount;
    this.environment = args.environment;
    this.accountExperimentsCollectionService = args.accountExperimentsCollectionService;

    this.unsubscribeWatcher = this.watchAccountExperimentsState((accountExperimentsState) => {
      this.accountExperimentsState = accountExperimentsState;
    });
  }

  public destroy(): void {
    this.unsubscribeWatcher();
  }

  private watchAccountExperimentsState(callback: Consumer<AccountExperimentsState>): Unsubscribe {
    // If the account experiments state is already set, call the callback with the current state.
    if (this.accountExperimentsState) {
      callback(this.accountExperimentsState);
    }

    return this.accountExperimentsCollectionService.watchDoc(
      this.accountId,
      (accountExperimentsState) => {
        if (!accountExperimentsState) {
          // If no account experiments state is found, assume default state.
          callback(
            makeDefaultAccountExperimentsState({
              accountId: this.accountId,
              isInternalAccount: this.isInternalAccount,
            })
          );
          return;
        }

        callback({
          accountId: this.accountId,
          accountVisibility: accountExperimentsState.accountVisibility,
          experimentOverrides: accountExperimentsState.experimentOverrides,
          // TODO(timestamps): Use server timestamps instead.
          createdTime: accountExperimentsState.createdTime,
          lastUpdatedTime: accountExperimentsState.lastUpdatedTime,
        });
      },
      (error) => {
        const message =
          'Failed to fetch account experiments state. Using default experiment values.';
        logger.error(prefixError(error, message));

        // Assume default experiment values in error case.
        callback(
          makeDefaultAccountExperimentsState({
            accountId: this.accountId,
            isInternalAccount: this.isInternalAccount,
          })
        );
      }
    );
  }

  public watchAccountExperiments(callback: Consumer<readonly AccountExperiment[]>): Unsubscribe {
    return this.watchAccountExperimentsState((accountExperimentsState) => {
      const accountExperiments = getExperimentsForAccount({
        environment: this.environment,
        accountVisibility: accountExperimentsState.accountVisibility,
        accountOverrides: accountExperimentsState.experimentOverrides,
      });
      callback(accountExperiments);
    });
  }

  public async setBooleanExperimentValue(args: {
    readonly experimentId: ExperimentId;
    readonly isEnabled: boolean;
  }): AsyncResult<void> {
    const {experimentId, isEnabled} = args;

    const pathToUpdate = `experimentOverrides.${experimentId}`;
    const experimentOverride = makeBooleanExperimentOverride({experimentId, isEnabled});

    const updateResult = await this.accountExperimentsCollectionService.updateDoc(this.accountId, {
      [pathToUpdate]: experimentOverride,
    });
    return prefixResultIfError(updateResult, 'Error updating boolean experiment value');
  }

  public async setStringExperimentValue(args: {
    readonly experimentId: ExperimentId;
    readonly isEnabled: boolean;
    readonly value: string;
  }): AsyncResult<void> {
    const {experimentId, isEnabled, value} = args;

    const pathToUpdate = `experimentOverrides.${experimentId}`;
    const experimentOverride = makeStringExperimentOverride({experimentId, isEnabled, value});

    const updateResult = await this.accountExperimentsCollectionService.updateDoc(this.accountId, {
      [pathToUpdate]: experimentOverride,
    });
    return prefixResultIfError(updateResult, 'Error updating string experiment value');
  }
}

const accountExperimentsFirestoreConverter = makeFirestoreDataConverter(
  toStorageAccountExperimentsState,
  parseAccountExperimentsState
);

type ClientAccountExperimentsCollectionService = ClientFirestoreCollectionService<
  AccountId,
  AccountExperimentsState
>;

export function useAccountExperimentsCollectionService(): ClientAccountExperimentsCollectionService {
  const accountExperimentsCollectionService = useMemo(() => {
    return new ClientFirestoreCollectionService({
      collectionPath: ACCOUNT_EXPERIMENTS_DB_COLLECTION,
      converter: accountExperimentsFirestoreConverter,
      parseId: parseAccountId,
    });
  }, []);

  return accountExperimentsCollectionService;
}
