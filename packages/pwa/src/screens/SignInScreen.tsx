import type {ActionCodeSettings} from 'firebase/auth';
import {useState} from 'react';
import styled from 'styled-components';

import {isValidEmail} from '@shared/lib/utils.shared';

import {parseEmailAddress} from '@shared/parsers/accounts.parser';

import {ThemeColor} from '@shared/types/theme.types';
import type {Consumer} from '@shared/types/utils.types';

import {authService} from '@sharedClient/services/auth.client';

import {useMaybeLoggedInAccount} from '@sharedClient/hooks/auth.hooks';

import {Button, ButtonVariant} from '@src/components/atoms/Button';
import {FlexColumn} from '@src/components/atoms/Flex';
import {Input} from '@src/components/atoms/Input';
import {Spacer} from '@src/components/atoms/Spacer';
import {Text} from '@src/components/atoms/Text';
import {ScreenWrapper} from '@src/components/layout/Screen';

import type {OnClick} from '@src/types/utils.pwa.types';

const PASSWORDLESS_AUTH_ACTION_CODE_SETTINGS: ActionCodeSettings = {
  url: import.meta.env.VITE_CONDUCTOR_URL, // URL to redirect back to.
  handleCodeInApp: true, // Must be true for this flow.
};

const SignInScreenWrapper = styled(ScreenWrapper).attrs({justify: 'center', align: 'center'})``;

const SignInContentWrapper = styled(FlexColumn)`
  width: 100%;
  max-width: 480px;
`;

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
    <Button
      variant={ButtonVariant.Primary}
      onClick={handleSignInButtonClick}
      disabled={!isValidEmail(maybeEmail)}
    >
      {children}
    </Button>
  );
};

export const SignInScreen: React.FC = () => {
  const {loggedInAccount} = useMaybeLoggedInAccount();

  const [emailInputVal, setEmailInputVal] = useState('');
  const [successfulSignInLinkSentTo, setSuccessfulSignInLinkSentTo] = useState<string | null>(null);
  const [signInLinkError, setSignInLinkError] = useState<Error | null>(null);
  let loggedInAccountContent: React.ReactNode = null;
  if (loggedInAccount) {
    loggedInAccountContent = <Text>Already signed in as {loggedInAccount.email}</Text>;
  }

  return (
    <SignInScreenWrapper>
      <SignInContentWrapper gap={16}>
        <Text as="h1" bold align="center">
          Conductor
        </Text>
        <Spacer y={16} />
        <Text as="h3" bold align="center">
          Enter email for a passwordless sign in link
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
        >
          Send link
        </PasswordlessAuthButton>
        {/* TODO: Remove this debug button. */}
        <PasswordlessAuthButton
          maybeEmail="wenger.jacob@gmail.com"
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
          Send link to myself
        </PasswordlessAuthButton>
        {successfulSignInLinkSentTo ? (
          <Text align="center">
            Check <b>{successfulSignInLinkSentTo}</b> for the sign in link.
          </Text>
        ) : null}
        {signInLinkError ? (
          <Text color={ThemeColor.Red600} align="center">
            {signInLinkError.message}
          </Text>
        ) : null}
        {loggedInAccountContent}
      </SignInContentWrapper>
    </SignInScreenWrapper>
  );
};
