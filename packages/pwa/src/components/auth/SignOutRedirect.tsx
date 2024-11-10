import {useEffect} from 'react';
import {useNavigate} from 'react-router-dom';

import {logger} from '@shared/lib/logger';
import {Urls} from '@shared/lib/urls';

import {authService} from '@shared/services/authService';

/**
 * Signs the user out and redirects them to sign in page.
 */
export const SignOutRedirect: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const go = async () => {
      const signOutResult = await authService.signOut();
      if (!signOutResult.success) {
        // TODO: Filter out error message that are expected user error.
        logger.error('Failed to sign out user', {error: signOutResult.error});
        // TODO: Surface error to user.
        return;
      }

      // Don't strand the user on a page they no longer have access to view.
      navigate(Urls.forSignIn());

      // TODO: Clear other stuff from local storage.
    };
    go();
  }, [navigate]);

  return null;
};
