import {useLocation} from 'react-router-dom';

import {Urls} from '@shared/lib/urls.shared';

import {ViewType} from '@shared/types/query.types';

import {FlexColumn} from '@src/components/atoms/Flex';
import {Link} from '@src/components/atoms/Link';
import {Text} from '@src/components/atoms/Text';

import type {ErrorNavigationState} from '@src/lib/error.pwa';

interface ErrorScreenProps {
  readonly error?: Error;
}

export const ErrorScreen: React.FC<ErrorScreenProps> = ({error: propError}) => {
  const location = useLocation();
  const navigationState = location.state as ErrorNavigationState | undefined;
  const error = propError ?? navigationState?.error ?? new Error('Unknown error');

  console.log('ErrorScreen render:', {
    propError,
    navigationState,
    locationState: location.state,
    error,
  });

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
