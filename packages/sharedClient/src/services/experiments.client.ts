import {useEffect, useMemo, useState} from 'react';

import {logger} from '@shared/services/logger.shared';

import {ACCOUNTS_EXPERIMENTS_DB_COLLECTION} from '@shared/lib/constants.shared';

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
    accountVisibility: DEFAULT_ACCOUNT_EXPERIMENT_VISIBILITY,
    experimentOverrides: {},
  });
  const accountExperimentsCollectionService = useAccountExperimentsCollectionService();

  useEffect(() => {
    async function go(): Promise<void> {
      // TODO: Switch to watchDoc.
      const experimentsResult = await accountExperimentsCollectionService.fetchById(accountId);
      if (!experimentsResult.success) {
        const message = 'Failed to fetch account experiments state. Using default experiments.';
        logger.error(new Error(message));
        return;
      }

      const accountExperimentsState = experimentsResult.value;

      let accountVisibility: ExperimentVisibility = DEFAULT_ACCOUNT_EXPERIMENT_VISIBILITY;
      if (accountExperimentsState?.accountVisibility) {
        accountVisibility = accountExperimentsState.accountVisibility;
      }

      let experimentOverrides: AccountExperimentOverrides = {};
      if (accountExperimentsState?.experimentOverrides) {
        experimentOverrides = accountExperimentsState.experimentOverrides;
      }

      setState({accountVisibility, experimentOverrides});
    }

    void go();
  }, [accountId, accountExperimentsCollectionService]);

  return state;
}
