import {DEFAULT_NAV_ITEM} from '@shared/lib/navItems.shared';

import {FlexColumn} from '@src/components/atoms/Flex';
import {Text} from '@src/components/atoms/Text';
import {NavItemLink} from '@src/components/nav/NavItemLink';

import {Screen} from '@src/screens/Screen';

// TODO: Improve design of error screen.
export const ErrorScreen: React.FC<{readonly error: Error}> = ({error}) => {
  const navItem = DEFAULT_NAV_ITEM;

  return (
    <Screen align="center" justify="center" maxWidth={960}>
      <FlexColumn align="center" gap={2}>
        <Text as="h1">Something went wrong</Text>
        <Text as="p" className="text-error">
          <Text as="span" bold>
            Error:
          </Text>{' '}
          {error.message}
        </Text>
        <NavItemLink navItemId={navItem.id}>
          <Text as="p" underline="always">
            Go to {navItem.title}
          </Text>
        </NavItemLink>
      </FlexColumn>
    </Screen>
  );
};
