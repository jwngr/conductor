import {ViewType} from '@shared/types/query';
import styled from 'styled-components';

import {View} from '../components/views/View';

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
