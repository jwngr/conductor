import {useCallback, useEffect, useMemo, useState} from 'react';

import {logger} from '@shared/services/logger.shared';

import {ACCOUNTS_EXPERIMENTS_DB_COLLECTION} from '@shared/lib/constants.shared';
import {prefixError} from '@shared/lib/errorUtils.shared';

import {parseAccountId} from '@shared/parsers/accounts.parser';
import {
  parseAccountExperimentsState,
  toStorageAccountExperimentsState,
} from '@shared/parsers/experiments.parser';

import type {AccountId} from '@shared/types/accounts.types';
import type {
  AccountExperimentOverrides,
  AccountExperimentsState,
} from '@shared/types/experiments.types';
import {ExperimentVisibility} from '@shared/types/experiments.types';

import {
  ClientFirestoreCollectionService,
  makeFirestoreDataConverter,
} from '@sharedClient/services/firestore.client';

const DEFAULT_ACCOUNT_EXPERIMENT_VISIBILITY = ExperimentVisibility.Public;

const accountExperimentsFirestoreConverter = makeFirestoreDataConverter(
  toStorageAccountExperimentsState,
  parseAccountExperimentsState
);

export type ClientAccountExperimentsCollectionService = ClientFirestoreCollectionService<
  AccountId,
  AccountExperimentsState
>;

export function useAccountExperimentsCollectionService(): ClientAccountExperimentsCollectionService {
  const accountExperimentsCollectionService = useMemo(() => {
    return new ClientFirestoreCollectionService({
      collectionPath: ACCOUNTS_EXPERIMENTS_DB_COLLECTION,
      converter: accountExperimentsFirestoreConverter,
      parseId: parseAccountId,
    });
  }, []);

  return accountExperimentsCollectionService;
}

export function useAccountExperimentsState(accountId: AccountId): AccountExperimentsState {
  const [state, setState] = useState<AccountExperimentsState>({
    accountId,
    accountVisibility: DEFAULT_ACCOUNT_EXPERIMENT_VISIBILITY,
    experimentOverrides: {},
  });
  const accountExperimentsCollectionService = useAccountExperimentsCollectionService();

  const resetState = useCallback(() => {
    setState({
      accountId,
      accountVisibility: DEFAULT_ACCOUNT_EXPERIMENT_VISIBILITY,
      experimentOverrides: {},
    });
  }, [accountId]);

  const handleOnData = useCallback(
    (accountExperimentsState: AccountExperimentsState | null): void => {
      if (!accountExperimentsState) {
        const message = 'Failed to fetch account experiments state. Resetting to default.';
        logger.error(new Error(message));
        resetState();
        return;
      }

      let accountVisibility: ExperimentVisibility = DEFAULT_ACCOUNT_EXPERIMENT_VISIBILITY;
      if (accountExperimentsState?.accountVisibility) {
        accountVisibility = accountExperimentsState.accountVisibility;
      }

      let experimentOverrides: AccountExperimentOverrides = {};
      if (accountExperimentsState?.experimentOverrides) {
        experimentOverrides = accountExperimentsState.experimentOverrides;
      }

      setState({accountId, accountVisibility, experimentOverrides});
    },
    [accountId, resetState]
  );

  const handleError = useCallback(
    (error: Error): void => {
      const message = 'Failed to fetch account experiments state. Using default experiments.';
      const betterError = prefixError(error, message);
      logger.error(betterError);
      resetState();
    },
    [resetState]
  );

  useEffect(() => {
    const unsubscribe = accountExperimentsCollectionService.watchDoc(
      accountId,
      handleOnData,
      handleError
    );

    return () => unsubscribe();
  }, [accountExperimentsCollectionService, handleOnData, handleError, accountId]);

  return state;
}
