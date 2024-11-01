import React from 'react';
import styled from 'styled-components';

import {Urls} from '@shared/lib/urls';

import {useMaybeLoggedInUser} from '@src/lib/users';

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
  const {isLoading, loggedInUser} = useMaybeLoggedInUser();

  let authContent: React.ReactNode = null;
  if (!isLoading && loggedInUser) {
    authContent = (
      <>
        <Text light>{loggedInUser.email}</Text>
        <Spacer x={12} />
        <Link to={Urls.forSignOut()}>
          <Text underline="hover">Sign out</Text>
        </Link>
      </>
    );
  }

  return (
    <AppHeaderWrapper>
      <Text as="h2">Conductor</Text>
      <Spacer flex />
      {authContent}
    </AppHeaderWrapper>
  );
};
