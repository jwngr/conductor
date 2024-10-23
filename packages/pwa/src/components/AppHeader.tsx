import React from 'react';
import styled from 'styled-components';

import {Urls} from '@shared/lib/urls';

import {useUserStore} from '@src/stores/UserStore';

import {FlexRow} from './atoms/Flex';
import {Link} from './atoms/Link';
import {Spacer} from './atoms/Spacer';
import {Text} from './atoms/Text';

const AppHeaderWrapper = styled(FlexRow)`
  height: 60px;
  padding: 0 16px;
  border-bottom: 1px solid red;
`;

export const AppHeader: React.FC = () => {
  const loggedInUser = useUserStore((state) => state.loggedInUser);
  const hasFetchedLoggedInUser = useUserStore((state) => state.hasFetchedLoggedInUser);

  return (
    <AppHeaderWrapper>
      <Text as="h2">Conductor</Text>

      <Spacer flex />

      <Text light>{hasFetchedLoggedInUser ? (loggedInUser?.email ?? '---') : '???'}</Text>
      <Spacer x={12} />
      <Link to={Urls.forSignOut()}>
        <Text underline="hover">Sign out</Text>
      </Link>
    </AppHeaderWrapper>
  );
};
