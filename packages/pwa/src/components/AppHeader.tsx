import React from 'react';
import styled from 'styled-components';

import {FlexRow} from './atoms/Flex';
import {Spacer} from './atoms/Spacer';
import {Text} from './atoms/Text';

const AppHeaderWrapper = styled(FlexRow)`
  height: 100px;
  border-bottom: 1px solid red;
`;

export const AppHeader: React.FC = () => {
  return (
    <AppHeaderWrapper>
      <Text>Conductor</Text>
      <Spacer flex />
      <Text>Settings</Text>
    </AppHeaderWrapper>
  );
};
