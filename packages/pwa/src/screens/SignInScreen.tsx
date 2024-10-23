import {sendSignInLinkToEmail} from 'firebase/auth';
import {useState} from 'react';

import {auth} from '@shared/lib/firebase';
import {logger} from '@shared/lib/logger';

import {FlexColumn} from '@src/components/atoms/Flex';
import {Text} from '@src/components/atoms/Text';

import {Input} from '../components/atoms/Input';

const PASSWORDLESS_AUTH_ACTION_CODE_SETTINGS = {
  // URL to redirect back to.
  // TODO: Make this dynamic.
  // TODO: Add URLs here to the authorized domains list in the Firebase Console.
  url: 'http://localhost:5173/',
  handleCodeInApp: true, // Must be true for this flow.
};

const PasswordlessAuthButton: React.FC<{email: string}> = ({email}) => {
  const handleSignInButtonClick = async () => {
    try {
      await sendSignInLinkToEmail(auth, email, PASSWORDLESS_AUTH_ACTION_CODE_SETTINGS);
      // Save the email locally so we don't need to reprompt for it again if they open the link on the same device.
      window.localStorage.setItem('emailForSignIn', email);
      // Clear the URL query params so we don't end up back here.
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (error) {
      const errorMessage = 'Error sending passwordless sign in link';
      logger.error(errorMessage, {error});
      if (error instanceof Error) {
        throw new Error(`${errorMessage}: ${error.message}`, {cause: error});
      } else {
        throw new Error(`${errorMessage}: ${error}`);
      }
    }
  };

  return <button onClick={handleSignInButtonClick}>Send sign in link</button>;
};

export const SignInScreen: React.FC = () => {
  const [emailInputVal, setEmailInputVal] = useState('');

  return (
    <FlexColumn gap={12} align="flex-start">
      <Text as="h3" bold>
        Enter email for passwordless sign in
      </Text>
      <Input
        type="email"
        value={emailInputVal}
        placeholder="Enter email"
        onChange={(event) => setEmailInputVal(event.target.value)}
      />
      <PasswordlessAuthButton email={emailInputVal} />
    </FlexColumn>
  );
};
