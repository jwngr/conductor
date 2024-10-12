import {ViewType} from '@shared/types/query';
import {View} from '@src/components/View';
import styled from 'styled-components';

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
