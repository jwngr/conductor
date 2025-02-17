import type React from 'react';
import styled from 'styled-components';

import {Urls} from '@shared/lib/urls.shared';

import {useMaybeLoggedInAccount} from '@sharedClient/hooks/auth.hooks';

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
  const {isLoading, loggedInAccount} = useMaybeLoggedInAccount();

  let authContent: React.ReactNode = null;
  if (!isLoading && loggedInAccount) {
    authContent = (
      <>
        <Text light>{loggedInAccount.email}</Text>
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
