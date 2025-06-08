import type React from 'react';

import {DEFAULT_ERROR_TITLE} from '@shared/lib/errorUtils.shared';

import {
  DEFAULT_ROUTE_HERO_PAGE_ACTION,
  REFRESH_HERO_PAGE_ACTION,
} from '@sharedClient/lib/heroActions.client';

import {useMaybeLoggedInAccount} from '@sharedClient/hooks/auth.hooks';

import type {HeroAction} from '@sharedClient/types/heroActions.client.types';

import {Divider} from '@src/components/atoms/Divider';
import {FlexColumn, FlexRow} from '@src/components/atoms/Flex';
import {Link} from '@src/components/atoms/Link';
import {Spacer} from '@src/components/atoms/Spacer';
import {H5, P} from '@src/components/atoms/Text';
import {ErrorArea} from '@src/components/errors/ErrorArea';
import {ConductorLogo} from '@src/components/logos/ConductorLogo';

import {signOutRoute} from '@src/routes';
import {Screen} from '@src/screens/Screen';

const ErrorScreenAuthFooter: React.FC = () => {
  const {isLoading, loggedInAccount} = useMaybeLoggedInAccount();

  if (isLoading) {
    return null;
  }

  let innerContent: React.ReactNode;
  if (loggedInAccount) {
    // TODO: Make this more responsive on mobile.
    innerContent = (
      <FlexRow align="center" gap={3}>
        <H5 light>
          Logged in as <b>{loggedInAccount.email}</b>
        </H5>
        <Divider y={24} x={1} />
        <Link to={signOutRoute.fullPath} replace>
          <H5 underline="always" light nowrap>
            Sign out
          </H5>
        </Link>
      </FlexRow>
    );
  } else {
    innerContent = (
      <P align="center" light>
        Not logged in
      </P>
    );
  }

  return (
    <FlexRow gap={3} align="center" justify="center" className="h-full w-full">
      {innerContent}
    </FlexRow>
  );
};

const ErrorScreen: React.FC<{
  readonly error: Error;
  readonly title: string | React.ReactElement;
  readonly subtitle: string | React.ReactElement;
  readonly actions: readonly HeroAction[];
}> = ({error, title, subtitle, actions}) => {
  return (
    <Screen>
      <div className="relative">
        {/* Conductor logo, top left. */}
        <FlexRow className="absolute top-4 left-4 z-10">
          <ConductorLogo />
        </FlexRow>

        {/* Main error content, centered horizontally and vertically. */}
        <FlexColumn align="center" justify="center" className="min-h-screen px-4">
          <ErrorArea error={error} title={title} subtitle={subtitle} actions={actions} />

          {/* Add a space the same size as the footer to ensure all main content is visible. */}
          <Spacer y={80} />
        </FlexColumn>

        {/* Auth state, centered at bottom. */}
        <div className="bg-background fixed bottom-0 left-0 h-[80px] w-full">
          <ErrorScreenAuthFooter />
        </div>
      </div>
    </Screen>
  );
};

export const DefaultErrorScreen: React.FC<{
  readonly error: Error;
}> = ({error}) => {
  const {isLoading, loggedInAccount} = useMaybeLoggedInAccount();

  const isLoggedIn = isLoading ? false : loggedInAccount !== null;

  return (
    <ErrorScreen
      error={error}
      title={DEFAULT_ERROR_TITLE}
      subtitle={error.message}
      actions={
        isLoggedIn
          ? [DEFAULT_ROUTE_HERO_PAGE_ACTION, REFRESH_HERO_PAGE_ACTION]
          : [REFRESH_HERO_PAGE_ACTION]
      }
    />
  );
};
