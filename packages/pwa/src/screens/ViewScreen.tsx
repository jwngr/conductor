import styled from 'styled-components';

import {ViewType} from '@shared/types/query';

import {View} from '@src/components/View';

const ViewScreenWrapper = styled.div`
  padding: 20px;
`;

export const ViewScreen: React.FC<{
  readonly viewType: ViewType;
}> = ({viewType}) => {
  return (
    <ViewScreenWrapper>
      <View viewType={viewType} />
    </ViewScreenWrapper>
  );
};
