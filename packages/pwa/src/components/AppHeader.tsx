import React from 'react';
import styled from 'styled-components';

import {Urls} from '@shared/lib/urls.shared';

import {useMaybeLoggedInUser} from '@sharedClient/hooks/auth.hooks';

import {FlexRow} from '@src/components/atoms/Flex';
import {Link} from '@src/components/atoms/Link';
import {Spacer} from '@src/components/atoms/Spacer';
import {Text} from '@src/components/atoms/Text';

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
