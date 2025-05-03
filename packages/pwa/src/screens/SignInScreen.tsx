import {Navigate} from '@tanstack/react-router';
import type {ActionCodeSettings} from 'firebase/auth';
import {useCallback, useState} from 'react';

import {isValidEmail} from '@shared/lib/utils.shared';

import {parseEmailAddress} from '@shared/parsers/accounts.parser';

import type {Consumer} from '@shared/types/utils.types';

import {authService} from '@sharedClient/services/auth.client';

import {useMaybeLoggedInAccount} from '@sharedClient/hooks/auth.hooks';

import {Button} from '@src/components/atoms/Button';
import {Input} from '@src/components/atoms/Input';
import {Spacer} from '@src/components/atoms/Spacer';
import {Text} from '@src/components/atoms/Text';

import type {OnClick} from '@src/types/utils.pwa.types';

import {rootRoute} from '@src/routes/__root';
import {Screen} from '@src/screens/Screen';

const PASSWORDLESS_AUTH_ACTION_CODE_SETTINGS: ActionCodeSettings = {
  url: import.meta.env.VITE_CONDUCTOR_URL, // URL to redirect back to.
  handleCodeInApp: true, // Must be true for this flow.
};

const PasswordlessAuthButton: React.FC<{
  readonly children: React.ReactNode;
  readonly maybeEmail: string;
  readonly onClick: OnClick<HTMLButtonElement>;
  readonly onSuccess: Consumer<string>;
  readonly onError: Consumer<Error>;
}> = ({children, maybeEmail, onClick, onSuccess, onError}) => {
  const handleSignInButtonClick: OnClick<HTMLButtonElement> = async (event) => {
    onClick(event);

    const emailResult = parseEmailAddress(maybeEmail);
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
    <Button onClick={handleSignInButtonClick} disabled={!isValidEmail(maybeEmail)}>
      {children}
    </Button>
  );
};

export const SignInScreen: React.FC = () => {
  const {loggedInAccount} = useMaybeLoggedInAccount();

  const [emailInputVal, setEmailInputVal] = useState('');
  const [successfulSignInLinkSentTo, setSuccessfulSignInLinkSentTo] = useState<string | null>(null);
  const [signInLinkError, setSignInLinkError] = useState<Error | null>(null);

  const renderPasswordlessAuthButton = useCallback(
    ({maybeEmail, text}: {readonly maybeEmail: string; readonly text: string}): React.ReactNode => (
      <PasswordlessAuthButton
        maybeEmail={maybeEmail}
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
      >
        {text}
      </PasswordlessAuthButton>
    ),
    []
  );

  // Redirect to root if already logged in.
  if (loggedInAccount) {
    return <Navigate to={rootRoute.fullPath} replace />;
  }

  return (
    <Screen align="center" justify="center" gap={4} maxWidth={480}>
      <Text as="h1" bold align="center">
        Conductor
      </Text>
      <Spacer y={8} />
      <Text as="h3" bold align="center">
        Enter email for a passwordless sign in link
      </Text>
      <Input
        type="email"
        value={emailInputVal}
        placeholder="Enter email"
        onChange={(event) => setEmailInputVal(event.target.value)}
      />
      {renderPasswordlessAuthButton({
        maybeEmail: emailInputVal,
        text: 'Send link',
      })}
      {/* TODO: Remove this debug button. */}
      {renderPasswordlessAuthButton({
        maybeEmail: 'wenger.jacob@gmail.com',
        text: 'Send link to myself',
      })}

      {successfulSignInLinkSentTo ? (
        <Text align="center">
          Check <b>{successfulSignInLinkSentTo}</b> for the sign in link.
        </Text>
      ) : null}
      {signInLinkError ? (
        <Text className="text-error" align="center">
          <Text bold>Error signing in:</Text> {signInLinkError.message}
        </Text>
      ) : null}
    </Screen>
  );
};
