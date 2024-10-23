import React from 'react';
import styled from 'styled-components';

import {Urls} from '@shared/lib/urls';

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
  return (
    <AppHeaderWrapper>
      <Text>Conductor</Text>
      <Spacer flex />
      <Link to={Urls.forSignOut()}>
        <Text underline="hover">Sign out</Text>
      </Link>
    </AppHeaderWrapper>
  );
};
