import {useEffect} from 'react';

import {isInternalAccount} from '@shared/lib/accounts.shared';

import {Environment} from '@shared/types/environment.types';

import {useExperimentsStore} from '@sharedClient/stores/ExperimentsStore';

import {
  clientAccountExperimentsCollectionService,
  ClientExperimentsService,
} from '@sharedClient/services/experiments.client';

import {useLoggedInAccount} from '@sharedClient/hooks/auth.hooks';
import {useEventLogService} from '@sharedClient/hooks/eventLog.hooks';

export const PWAExperimentsListener: React.FC = () => {
  const loggedInAccount = useLoggedInAccount();
  const eventLogService = useEventLogService();
  const {setExperiments, setExperimentsService, resetExperimentsStore} = useExperimentsStore();

  useEffect(() => {
    const pwaExperimentsService = new ClientExperimentsService({
      environment: Environment.PWA,
      accountId: loggedInAccount.accountId,
      accountExperimentsCollectionService: clientAccountExperimentsCollectionService,
      isInternalAccount: isInternalAccount({email: loggedInAccount.email}),
      eventLogService,
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
    eventLogService,
    loggedInAccount.accountId,
    loggedInAccount.email,
  ]);

  return null;
};
