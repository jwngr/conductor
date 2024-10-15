import styled from 'styled-components';

import {ViewType} from '@shared/types/query';

import {View} from '@src/components/View';

const StarredScreenWrapper = styled.div`
  padding: 20px;
`;

export const StarredScreen: React.FC = () => {
  return (
    <StarredScreenWrapper>
      <View viewType={ViewType.Starred} />
    </StarredScreenWrapper>
  );
};
