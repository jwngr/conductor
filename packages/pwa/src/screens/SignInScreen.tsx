import type {ActionCodeSettings} from 'firebase/auth';
import {useCallback, useState} from 'react';

import {isValidEmail} from '@shared/lib/emails.shared';

import {parseEmailAddress} from '@shared/parsers/emails.parser';

import type {Consumer} from '@shared/types/utils.types';

import {useMaybeLoggedInAccount} from '@sharedClient/hooks/auth.hooks';

import {Button} from '@src/components/atoms/Button';
import {Input} from '@src/components/atoms/Input';
import {Spacer} from '@src/components/atoms/Spacer';
import {H1, H3, P, Span} from '@src/components/atoms/Text';

import {authService} from '@src/lib/auth.pwa';
import {env, IS_DEVELOPMENT} from '@src/lib/environment.pwa';

import type {OnClick} from '@src/types/utils.pwa.types';

import {DefaultRouteRedirect} from '@src/routes/Redirects';
import {Screen} from '@src/screens/Screen';

const PASSWORDLESS_AUTH_ACTION_CODE_SETTINGS: ActionCodeSettings = {
  url: env.conductorUrl, // URL to redirect back to.
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

interface SignInScreenState {
  readonly emailInputVal: string;
  readonly successfulSignInLinkSentTo: string | null;
  readonly signInLinkError: Error | null;
}

const INITIAL_SIGN_IN_SCREEN_STATE: SignInScreenState = {
  emailInputVal: '',
  successfulSignInLinkSentTo: null,
  signInLinkError: null,
};

export const SignInScreen: React.FC = () => {
  const {loggedInAccount} = useMaybeLoggedInAccount();

  const [state, setState] = useState<SignInScreenState>(INITIAL_SIGN_IN_SCREEN_STATE);

  const renderPasswordlessAuthButton = useCallback(
    ({maybeEmail, text}: {readonly maybeEmail: string; readonly text: string}): React.ReactNode => (
      <PasswordlessAuthButton
        maybeEmail={maybeEmail}
        onClick={() => {
          setState((current) => ({
            ...current,
            signInLinkError: null,
            successfulSignInLinkSentTo: null,
          }));
        }}
        onSuccess={(email) => {
          setState((current) => ({
            ...current,
            successfulSignInLinkSentTo: email,
            signInLinkError: null,
          }));
        }}
        onError={(error) => {
          setState((current) => ({
            ...current,
            signInLinkError: error,
            successfulSignInLinkSentTo: null,
          }));
        }}
      >
        {text}
      </PasswordlessAuthButton>
    ),
    []
  );

  // Redirect to root if already logged in.
  if (loggedInAccount) {
    return <DefaultRouteRedirect />;
  }

  return (
    <Screen selectedNavItemId={null} align="center" justify="center" gap={4} maxWidth={480}>
      <H1 bold align="center">
        Conductor
      </H1>
      <Spacer y={8} />
      <H3 bold align="center">
        Enter email for a passwordless sign in link
      </H3>
      <Input
        type="email"
        value={state.emailInputVal}
        placeholder="Enter email"
        onChange={(event) =>
          setState((current) => ({...current, emailInputVal: event.target.value}))
        }
      />
      {renderPasswordlessAuthButton({
        maybeEmail: state.emailInputVal,
        text: 'Send link',
      })}

      {IS_DEVELOPMENT
        ? renderPasswordlessAuthButton({
            maybeEmail: env.defaultPasswordlessEmailAddress,
            text: 'Send link to myself',
          })
        : null}

      {state.successfulSignInLinkSentTo ? (
        <P align="center">
          Check <b>{state.successfulSignInLinkSentTo}</b> for the sign in link.
        </P>
      ) : null}
      {state.signInLinkError ? (
        <P error align="center">
          <Span bold>Error signing in:</Span> {state.signInLinkError.message}
        </P>
      ) : null}
    </Screen>
  );
};
