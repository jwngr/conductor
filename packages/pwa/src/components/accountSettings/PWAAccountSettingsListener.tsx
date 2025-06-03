import {useEffect} from 'react';

import {logger} from '@shared/services/logger.shared';

import {prefixError} from '@shared/lib/errorUtils.shared';

import {useAccountSettingsStore} from '@sharedClient/stores/AccountSettingsStore';

import {
  clientAccountSettingsCollectionService,
  ClientAccountSettingsService,
} from '@sharedClient/services/accountSettings.client';

import {toast} from '@sharedClient/lib/toasts.client';

import {useLoggedInAccount} from '@sharedClient/hooks/auth.hooks';
import {useEventLogService} from '@sharedClient/hooks/eventLog.hooks';

export const PWAAccountSettingsListener: React.FC = () => {
  const loggedInAccount = useLoggedInAccount();
  const eventLogService = useEventLogService();
  const {setAccountSettings, setAccountSettingsService, resetAccountSettingsStore} =
    useAccountSettingsStore();

  useEffect(() => {
    const pwaAccountSettingsService = new ClientAccountSettingsService({
      accountId: loggedInAccount.accountId,
      accountSettingsCollectionService: clientAccountSettingsCollectionService,
      eventLogService,
    });

    setAccountSettingsService(pwaAccountSettingsService);

    const unsubscribe = pwaAccountSettingsService.watchAccountSettings(
      setAccountSettings,
      (error) => {
        const message = 'Failed to fetch account settings';
        const betterError = prefixError(error, message);
        logger.error(betterError);
        toast.error(message);
      }
    );

    return () => {
      unsubscribe();
      resetAccountSettingsStore();
    };
  }, [
    setAccountSettings,
    setAccountSettingsService,
    resetAccountSettingsStore,
    eventLogService,
    loggedInAccount.accountId,
  ]);

  return null;
};
