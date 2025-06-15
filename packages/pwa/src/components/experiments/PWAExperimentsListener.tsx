import {useEffect} from 'react';

import {Environment} from '@shared/types/environment.types';

import {useExperimentsStore} from '@sharedClient/stores/ExperimentsStore';

import {ClientExperimentsService} from '@sharedClient/services/experiments.client';

import {useLoggedInAccount} from '@sharedClient/hooks/auth.hooks';
import {useEventLogService} from '@sharedClient/hooks/eventLog.hooks';

import {env} from '@src/lib/environment.pwa';
import {firebaseService} from '@src/lib/firebase.pwa';

export const PWAExperimentsListener: React.FC = () => {
  const loggedInAccount = useLoggedInAccount();
  const eventLogService = useEventLogService({firebaseService});
  const {setExperiments, setExperimentsService, resetExperimentsStore} = useExperimentsStore();

  useEffect(() => {
    const pwaExperimentsService = new ClientExperimentsService({
      environment: Environment.PWA,
      accountId: loggedInAccount.accountId,
      isInternalAccount: loggedInAccount.email === env.defaultPasswordlessEmailAddress,
      eventLogService,
      firebaseService,
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
