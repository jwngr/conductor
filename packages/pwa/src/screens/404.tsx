import {DEFAULT_ROUTE_HERO_PAGE_ACTION} from '@sharedClient/lib/heroActions.client';

import {useMaybeLoggedInAccount} from '@sharedClient/hooks/auth.hooks';

import {HeroArea} from '@src/components/hero/HeroArea';

import {Screen} from '@src/screens/Screen';

const DEFAULT_NOT_FOUND_TITLE = 'Page not found';
const DEFAULT_NOT_FOUND_SUBTITLE =
  'You may not have access, or it might have been deleted. Check the URL and try again.';

export const NotFoundScreen: React.FC<{
  readonly title: string | undefined;
  readonly subtitle: string | undefined;
}> = ({title, subtitle}) => {
  const {isLoading, loggedInAccount} = useMaybeLoggedInAccount();

  if (isLoading) return null;

  const isLoggedIn = loggedInAccount !== null;

  return (
    <Screen selectedNavItemId={null} withHeader={isLoggedIn} align="center" justify="center">
      <HeroArea
        title={title ?? DEFAULT_NOT_FOUND_TITLE}
        subtitle={subtitle ?? DEFAULT_NOT_FOUND_SUBTITLE}
        actions={isLoggedIn ? [DEFAULT_ROUTE_HERO_PAGE_ACTION] : []}
      />
    </Screen>
  );
};
