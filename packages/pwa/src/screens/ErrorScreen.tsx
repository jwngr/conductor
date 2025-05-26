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
import {Text} from '@src/components/atoms/Text';
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
    innerContent = (
      <FlexRow align="center" gap={3}>
        <Text as="h5" light>
          Logged in as <b>{loggedInAccount.email}</b>
        </Text>
        <Divider y={24} x={1} />
        <Link to={signOutRoute.fullPath} replace>
          <Text as="h5" underline="always" light>
            Sign out
          </Text>
        </Link>
      </FlexRow>
    );
  } else {
    innerContent = (
      <Text as="p" light>
        Not logged in
      </Text>
    );
  }

  return (
    <FlexRow align="center" gap={3}>
      {innerContent}
    </FlexRow>
  );
};

export const ErrorScreen: React.FC<{
  readonly error: Error;
  readonly title: string | React.ReactElement;
  readonly subtitle: string | React.ReactElement;
  readonly actions: readonly HeroAction[];
}> = ({error, title, subtitle, actions}) => {
  return (
    <div className="relative">
      <Screen maxWidth={960}>
        {/* Conductor logo, top left. */}
        <FlexRow className="absolute top-4 left-4 z-10">
          <ConductorLogo />
        </FlexRow>

        {/* Main error content, centered horizontally and vertically. */}
        <FlexColumn align="center" justify="center" className="min-h-screen px-4">
          <ErrorArea error={error} title={title} subtitle={subtitle} actions={actions} />
        </FlexColumn>

        {/* Auth state, centered at bottom. */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <ErrorScreenAuthFooter />
        </div>
      </Screen>
    </div>
  );
};

export const DefaultErrorScreen: React.FC<{
  readonly error: Error;
}> = ({error}) => {
  return (
    <ErrorScreen
      error={error}
      title={DEFAULT_ERROR_TITLE}
      subtitle={error.message}
      actions={[DEFAULT_ROUTE_HERO_PAGE_ACTION, REFRESH_HERO_PAGE_ACTION]}
    />
  );
};
