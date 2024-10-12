import {ViewType} from '@shared/types/query';
import {View} from '@src/components/View';
import styled from 'styled-components';

const DoneScreenWrapper = styled.div`
  padding: 20px;
`;

export const DoneScreen: React.FC = () => {
  return (
    <DoneScreenWrapper>
      <View viewType={ViewType.Done} />
    </DoneScreenWrapper>
  );
};
