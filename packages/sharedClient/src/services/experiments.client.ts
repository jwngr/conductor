import {useMemo} from 'react';

import {logger} from '@shared/services/logger.shared';

import {ACCOUNT_EXPERIMENTS_DB_COLLECTION} from '@shared/lib/constants.shared';
import {prefixError, prefixResultIfError} from '@shared/lib/errorUtils.shared';
import {getExperimentsForAccount} from '@shared/lib/experiments.shared';

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
import {ExperimentVisibility} from '@shared/types/experiments.types';
import type {AsyncResult} from '@shared/types/results.types';
import type {Consumer, Unsubscribe} from '@shared/types/utils.types';

import {
  ClientFirestoreCollectionService,
  makeFirestoreDataConverter,
} from '@sharedClient/services/firestore.client';

const DEFAULT_ACCOUNT_EXPERIMENT_VISIBILITY = ExperimentVisibility.Public;

export class ClientExperimentsService {
  private readonly environment: ClientEnvironment;
  private accountExperimentsCollectionService: ClientAccountExperimentsCollectionService;
  private accountExperimentsState: AccountExperimentsState | null = null;
  private readonly accountId: AccountId;

  constructor(args: {
    readonly accountId: AccountId;
    readonly environment: ClientEnvironment;
    readonly accountExperimentsCollectionService: ClientAccountExperimentsCollectionService;
  }) {
    this.accountId = args.accountId;
    this.environment = args.environment;
    this.accountExperimentsCollectionService = args.accountExperimentsCollectionService;

    this.watchAccountExperimentsState((accountExperimentsState) => {
      this.accountExperimentsState = accountExperimentsState;
    });
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
          // If no account experiments state is found, the user has never changed any experiments.
          // Use the default experiment values.
          callback({
            accountId: this.accountId,
            accountVisibility: DEFAULT_ACCOUNT_EXPERIMENT_VISIBILITY,
            experimentOverrides: {},
            // TODO(timestamps): Use server timestamps instead.
            createdTime: new Date(),
            lastUpdatedTime: new Date(),
          });
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

        callback({
          accountId: this.accountId,
          accountVisibility: DEFAULT_ACCOUNT_EXPERIMENT_VISIBILITY,
          experimentOverrides: {},
          // TODO(timestamps): Use server timestamps instead.
          createdTime: new Date(),
          lastUpdatedTime: new Date(),
        });
      }
    );
  }

  public watchAccountExperiments(callback: Consumer<readonly AccountExperiment[]>): Unsubscribe {
    return this.watchAccountExperimentsState((accountExperimentsState) => {
      const experimentStates = getExperimentsForAccount({
        environment: this.environment,
        accountVisibility: accountExperimentsState.accountVisibility,
        accountOverrides: accountExperimentsState.experimentOverrides,
      });
      callback(experimentStates);
    });
  }

  public watchExperiment(args: {
    readonly experimentId: ExperimentId;
    readonly callback: Consumer<AccountExperiment>;
  }): Unsubscribe {
    const {experimentId, callback} = args;

    const unsubscribe = this.watchAccountExperiments((experiments) => {
      const experiment = experiments.find(
        (experiment) => experiment.definition.experimentId === experimentId
      );

      callback(experiment);
    });

    return () => unsubscribe();
  }

  public async setBooleanExperimentValue(args: {
    readonly experimentId: ExperimentId;
    readonly value: boolean;
  }): AsyncResult<void> {
    const {experimentId, value} = args;

    const updateResult = await this.accountExperimentsCollectionService.setDocWithMerge(
      this.accountId,
      {[`experimentOverrides.${experimentId}`]: value}
    );
    return prefixResultIfError(updateResult, 'Error updating boolean experiment value');
  }

  public async setStringExperimentValue(args: {
    readonly experimentId: ExperimentId;
    readonly value: string;
  }): AsyncResult<void> {
    const {experimentId, value} = args;

    const updateResult = await this.accountExperimentsCollectionService.setDocWithMerge(
      this.accountId,
      {[`experimentOverrides.${experimentId}`]: value}
    );
    return prefixResultIfError(updateResult, 'Error updating string experiment value');
  }

  public async createAccountExperimentsState(): AsyncResult<void> {
    const addAccountExperimentsStateResult = await this.accountExperimentsCollectionService.setDoc(
      this.accountId,
      {
        accountId: this.accountId,
        accountVisibility: DEFAULT_ACCOUNT_EXPERIMENT_VISIBILITY,
        experimentOverrides: {},
        // TODO(timestamps): Use server timestamps instead.
        createdTime: new Date(),
        lastUpdatedTime: new Date(),
      }
    );
    return prefixResultIfError(
      addAccountExperimentsStateResult,
      'Error creating account experiments state'
    );
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
