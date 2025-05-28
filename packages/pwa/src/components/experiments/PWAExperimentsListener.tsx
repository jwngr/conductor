import {useEffect} from 'react';

import {getExperimentStatesForAccount} from '@shared/lib/experiments.shared';

import {Environment} from '@shared/types/environment.types';

import {useExperimentsStore} from '@sharedClient/stores/ExperimentsStore';

import {useAccountExperimentsState} from '@sharedClient/services/experiments.client';

import {useLoggedInAccount} from '@sharedClient/hooks/auth.hooks';

/**
 * Updates the experiment store every time the logged-in account's experiments state
 * changes, or the logged-in account itself changes.
 */
export const PWAExperimentsListener: React.FC = () => {
  const {setExperimentStates} = useExperimentsStore();
  const loggedInAccount = useLoggedInAccount();
  const accountExperimentsState = useAccountExperimentsState(loggedInAccount.accountId);

  useEffect(() => {
    const experiments = getExperimentStatesForAccount({
      environment: Environment.PWA,
      accountVisibility: accountExperimentsState.accountVisibility,
      accountOverrides: accountExperimentsState.experimentOverrides,
    });
    setExperimentStates(experiments);
  }, [setExperimentStates, accountExperimentsState]);

  return null;
};
