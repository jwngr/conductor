import {ViewType} from '@shared/types/query';
import styled from 'styled-components';

import {View} from '../components/views/View';

const AllScreenWrapper = styled.div`
  padding: 20px;
`;

export const AllScreen: React.FC = () => {
  return (
    <AllScreenWrapper>
      <View viewType={ViewType.All} />
    </AllScreenWrapper>
  );
};
