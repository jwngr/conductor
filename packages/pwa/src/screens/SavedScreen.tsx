import {ViewType} from '@shared/types/query';
import {View} from '@src/components/View';
import styled from 'styled-components';

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
