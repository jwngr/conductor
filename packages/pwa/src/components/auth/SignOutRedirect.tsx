import {useNavigate} from '@tanstack/react-router';
import {useEffect} from 'react';

import {logger} from '@shared/services/logger.shared';

import {prefixError} from '@shared/lib/errorUtils.shared';

import {authService} from '@sharedClient/services/auth.client';

import {signInRoute} from '@src/routes';

/**
 * Signs out the current account and redirects them to sign in page.
 */
export const SignOutRedirect: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const go = async (): Promise<void> => {
      const signOutResult = await authService.signOut();
      if (!signOutResult.success) {
        // TODO: Can this be de-duped with the error handler in `AuthServiceSubscription`?
        // TODO: Filter out expected user errors..
        logger.error(prefixError(signOutResult.error, 'Failed to sign out account'));
        // TODO: Surface error to user.
        return;
      }

      console.log('Navigating to root path BBB');
      // Don't strand the user on a page they no longer have access to view.
      await navigate({to: signInRoute.fullPath, replace: true});

      // TODO: Clear other stuff from local storage.
    };

    void go();
  }, [navigate]);

  return null;
};
