import styled from 'styled-components';

import {ViewType} from '@shared/types/query';

import {View} from '@src/components/View';

const UnreadScreenWrapper = styled.div`
  padding: 20px;
`;

export const UnreadScreen: React.FC = () => {
  return (
    <UnreadScreenWrapper>
      <View viewType={ViewType.Unread} />
    </UnreadScreenWrapper>
  );
};
