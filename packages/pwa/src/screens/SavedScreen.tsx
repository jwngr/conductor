import {ViewType} from '@shared/types/query';
import styled from 'styled-components';

import {View} from '../components/views/View';

const SavedScreenWrapper = styled.div`
  padding: 20px;
`;

export const SavedScreen: React.FC = () => {
  return (
    <SavedScreenWrapper>
      <View viewType={ViewType.Saved} />
    </SavedScreenWrapper>
  );
};
