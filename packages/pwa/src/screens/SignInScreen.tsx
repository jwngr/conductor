import {ActionCodeSettings, sendSignInLinkToEmail} from 'firebase/auth';
import {useState} from 'react';

import {auth} from '@shared/lib/firebase';
import {logger} from '@shared/lib/logger';
import {ThemeColor} from '@shared/types/theme';
import {Consumer} from '@shared/types/utils';

import {FlexColumn} from '@src/components/atoms/Flex';
import {Input} from '@src/components/atoms/Input';
import {Text} from '@src/components/atoms/Text';
import {useMaybeLoggedInUser} from '@src/lib/users';
import {OnClick} from '@src/types/utils';

const PASSWORDLESS_AUTH_ACTION_CODE_SETTINGS: ActionCodeSettings = {
  url: import.meta.env.VITE_CONDUCTOR_URL, // URL to redirect back to.
  handleCodeInApp: true, // Must be true for this flow.
};

const PasswordlessAuthButton: React.FC<{
  readonly email: string;
  readonly onClick: OnClick<HTMLButtonElement>;
  readonly onSuccess: Consumer<string>;
  readonly onError: Consumer<Error>;
}> = ({email, onSuccess, onError}) => {
  const handleSignInButtonClick = async () => {
    try {
      await sendSignInLinkToEmail(auth, email, PASSWORDLESS_AUTH_ACTION_CODE_SETTINGS);
      // Save the email locally so we don't need to reprompt for it again if they open the link on the same device.
      window.localStorage.setItem('emailForSignIn', email);
      onSuccess(email);
    } catch (error) {
      const errorMessage = 'Error sending passwordless sign in link';
      let betterError: Error;
      if (error instanceof Error) {
        betterError = new Error(`${errorMessage}: ${error.message}`, {cause: error});
      } else {
        betterError = new Error(`${errorMessage}: ${error}`);
      }
      logger.error(betterError.message, {error: betterError});
      onError(betterError);
    }
  };

  return <button onClick={handleSignInButtonClick}>Send sign in link</button>;
};

export const SignInScreen: React.FC = () => {
  const {loggedInUser} = useMaybeLoggedInUser();

  const [emailInputVal, setEmailInputVal] = useState('');
  const [successfulSignInLinkSentTo, setSuccessfulSignInLinkSentTo] = useState<string | null>(null);
  const [signInLinkError, setSignInLinkError] = useState<Error | null>(null);
  let loggedInUserContent: React.ReactNode = null;
  if (loggedInUser) {
    loggedInUserContent = <Text>Already signed in as {loggedInUser.email}</Text>;
  }

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
      <PasswordlessAuthButton
        email={emailInputVal}
        onClick={() => {
          setSignInLinkError(null);
          setSuccessfulSignInLinkSentTo(null);
        }}
        onSuccess={(email) => {
          setSuccessfulSignInLinkSentTo(email);
          setSignInLinkError(null);
          setEmailInputVal('');
        }}
        onError={(error) => {
          setSignInLinkError(error);
          setSuccessfulSignInLinkSentTo(null);
        }}
      />
      {successfulSignInLinkSentTo ? (
        <Text>
          Check <b>{successfulSignInLinkSentTo}</b> for the sign in link.
        </Text>
      ) : null}
      {signInLinkError ? <Text color={ThemeColor.Red600}>{signInLinkError.message}</Text> : null}
      {loggedInUserContent}
    </FlexColumn>
  );
};
