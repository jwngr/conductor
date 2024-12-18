import {Urls} from '@shared/lib/urls';

import {ViewType} from '@shared/types/query.types';

import {FlexColumn} from '@src/components/atoms/Flex';
import {Link} from '@src/components/atoms/Link';
import {Text} from '@src/components/atoms/Text';

// TODO: Improve design of error screen.
export const ErrorScreen: React.FC<{readonly error: Error}> = ({error}) => {
  const navItem = Urls.getNavItem(ViewType.Untriaged);
  return (
    <FlexColumn align="center" justify="center" style={{height: '100%', width: '100%'}} gap={8}>
      <Text as="h1">Oops... something went wrong</Text>
      <Text as="p">{error.message}</Text>
      <Link to="/">
        <Text as="p" underline="always">
          Go to {navItem.title}
        </Text>
      </Link>
    </FlexColumn>
  );
};
