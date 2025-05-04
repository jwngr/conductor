import {DEFAULT_NAV_ITEM} from '@shared/lib/navItems.shared';

import {useMaybeLoggedInAccount} from '@sharedClient/hooks/auth.hooks';

import {FlexColumn} from '@src/components/atoms/Flex';
import {Text} from '@src/components/atoms/Text';
import {NavItemLink} from '@src/components/nav/NavItemLink';

import {Screen} from '@src/screens/Screen';

// TODO: Improve design of 404 screen.
export const NotFoundScreen: React.FC<{readonly message: string}> = ({message}) => {
  const navItem = DEFAULT_NAV_ITEM;
  const {isLoading, loggedInAccount} = useMaybeLoggedInAccount();

  if (isLoading) return null;

  const isLoggedIn = loggedInAccount !== null;

  return (
    <Screen
      withHeader={isLoggedIn}
      withLeftSidebar={isLoggedIn}
      align="center"
      justify="center"
      maxWidth={960}
    >
      <FlexColumn align="center" gap={2}>
        <Text as="h1">404</Text>
        <Text as="p">{message}</Text>
        <NavItemLink navItemId={navItem.id}>
          <Text as="p" underline="always">
            Go to {navItem.title}
          </Text>
        </NavItemLink>
      </FlexColumn>
    </Screen>
  );
};
