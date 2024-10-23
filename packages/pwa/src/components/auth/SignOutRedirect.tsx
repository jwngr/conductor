import {signOut} from 'firebase/auth';
import {useEffect} from 'react';
import {useNavigate} from 'react-router-dom';

import {auth} from '@shared/lib/firebase';
import {logger} from '@shared/lib/logger';
import {Urls} from '@shared/lib/urls';

/**
 * Signs the user out and redirects them to sign in page.
 */
export const SignOutRedirect: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const go = async () => {
      try {
        await signOut(auth);
        // Don't strand the user on a page they no longer have access to view.
        navigate(Urls.forSignIn());
        // TODO: Clear other stuff from local storage.
      } catch (error) {
        // TODO: Filter out error message that are expected user error.
        const errorMessage = 'Failed to sign out user';
        logger.error(errorMessage, {error});
        if (error instanceof Error) {
          throw new Error(`${errorMessage}: ${error.message}`, {cause: error});
        } else {
          throw new Error(`${errorMessage}: ${error}`);
        }
      }
    };
    go();
  }, [navigate]);

  return null;
};
