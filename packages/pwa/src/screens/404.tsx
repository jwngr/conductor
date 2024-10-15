import {FlexColumn} from '@src/components/atoms/Flex';
import {Link} from '@src/components/atoms/Link';
import {Text} from '@src/components/atoms/Text';

// TODO: Make this page look nicer.
export const NotFoundScreen: React.FC = () => {
  return (
    <FlexColumn align="center" justify="center" style={{height: '100%'}} gap={8}>
      <Text as="h1">404</Text>
      <Text as="p">Not found</Text>
      <Link to="/">
        <Text as="p" underline="always">
          Go home
        </Text>
      </Link>
    </FlexColumn>
  );
};
