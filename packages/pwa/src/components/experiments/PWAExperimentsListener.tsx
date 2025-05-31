import {useEffect} from 'react';

import {Environment} from '@shared/types/environment.types';

import {useExperimentsStore} from '@sharedClient/stores/ExperimentsStore';

import {
  ClientExperimentsService,
  useAccountExperimentsCollectionService,
} from '@sharedClient/services/experiments.client';

import {useLoggedInAccount} from '@sharedClient/hooks/auth.hooks';

export const PWAExperimentsListener: React.FC = () => {
  const {setExperiments, setExperimentsService, resetExperimentsStore} = useExperimentsStore();
  const loggedInAccount = useLoggedInAccount();
  const accountExperimentsCollectionService = useAccountExperimentsCollectionService();

  useEffect(() => {
    const pwaExperimentsService = new ClientExperimentsService({
      environment: Environment.PWA,
      accountId: loggedInAccount.accountId,
      accountExperimentsCollectionService,
    });

    setExperimentsService(pwaExperimentsService);

    const unsubscribe = pwaExperimentsService.watchAccountExperiments(setExperiments);

    return () => {
      unsubscribe();
      resetExperimentsStore();
    };
  }, [
    setExperiments,
    setExperimentsService,
    resetExperimentsStore,
    accountExperimentsCollectionService,
    loggedInAccount.accountId,
  ]);

  return null;
};
