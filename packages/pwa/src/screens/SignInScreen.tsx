import {ActionCodeSettings} from 'firebase/auth';
import {useState} from 'react';

import {ThemeColor} from '@shared/types/theme.types';
import {createEmailAddress, isValidEmail} from '@shared/types/user.types';
import {Consumer} from '@shared/types/utils.types';

import {useMaybeLoggedInUser} from '@shared/hooks/auth.hooks';

import {FlexColumn} from '@src/components/atoms/Flex';
import {Input} from '@src/components/atoms/Input';
import {Text} from '@src/components/atoms/Text';

import {authService} from '@src/lib/auth.pwa';

import {OnClick} from '@src/types/utils.pwa.types';

const PASSWORDLESS_AUTH_ACTION_CODE_SETTINGS: ActionCodeSettings = {
  url: import.meta.env.VITE_CONDUCTOR_URL, // URL to redirect back to.
  handleCodeInApp: true, // Must be true for this flow.
};

const PasswordlessAuthButton: React.FC<{
  readonly maybeEmail: string;
  readonly onClick: OnClick<HTMLButtonElement>;
  readonly onSuccess: Consumer<string>;
  readonly onError: Consumer<Error>;
}> = ({maybeEmail, onClick, onSuccess, onError}) => {
  const handleSignInButtonClick: OnClick<HTMLButtonElement> = async (event) => {
    onClick(event);

    const emailResult = createEmailAddress(maybeEmail);
    if (!emailResult.success) {
      onError(emailResult.error);
      return;
    }
    const email = emailResult.value;

    const sendSignInLinkResult = await authService.sendSignInLinkToEmail(
      email,
      PASSWORDLESS_AUTH_ACTION_CODE_SETTINGS
    );
    if (!sendSignInLinkResult.success) {
      onError(sendSignInLinkResult.error);
      return;
    }

    // Save email locally to avoid reprompting for it again if opened on the same device.
    window.localStorage.setItem('emailForSignIn', email);

    onSuccess(email);
  };

  return (
    <button onClick={handleSignInButtonClick} disabled={!isValidEmail(maybeEmail)}>
      Send sign in link
    </button>
  );
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
        maybeEmail={emailInputVal}
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
