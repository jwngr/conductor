import {Urls} from '@shared/lib/urls';

import {ViewType} from '@shared/types/query';

import {FlexColumn} from '@src/components/atoms/Flex';
import {Link} from '@src/components/atoms/Link';
import {Text} from '@src/components/atoms/Text';

export const NotFoundScreen: React.FC<{readonly message: string}> = ({message}) => {
  const navItem = Urls.getNavItem(ViewType.Untriaged);
  return (
    <FlexColumn align="center" justify="center" style={{height: '100%', width: '100%'}} gap={8}>
      <Text as="h1">404</Text>
      <Text as="p">{message}</Text>
      <Link to="/">
        <Text as="p" underline="always">
          Go to {navItem.title}
        </Text>
      </Link>
    </FlexColumn>
  );
};
