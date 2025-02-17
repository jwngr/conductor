import {NavItemId, NavItems} from '@shared/types/urls.types';

import {FlexColumn} from '@src/components/atoms/Flex';
import {Link} from '@src/components/atoms/Link';
import {Text} from '@src/components/atoms/Text';
import {ScreenWrapper} from '@src/components/layout/Screen';

// TODO: Improve design of error screen.
export const ErrorScreen: React.FC<{readonly error: Error}> = ({error}) => {
  const navItem = NavItems.forId(NavItemId.Untriaged);
  return (
    <ScreenWrapper align="center" justify="center">
      <FlexColumn align="center" style={{maxWidth: 960}} gap={8}>
        <Text as="h1">Oops... something went wrong</Text>
        <Text as="p">{error.message}</Text>
        <Link to="/">
          <Text as="p" underline="always">
            Go to {navItem.title}
          </Text>
        </Link>
      </FlexColumn>
    </ScreenWrapper>
  );
};
