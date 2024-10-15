import styled from 'styled-components';

import {ViewType} from '@shared/types/query';

import {View} from '@src/components/View';

const AllScreenWrapper = styled.div`
  padding: 20px;
`;

// TODO: Unify all `*Screen` components that are defined based on `View`.
export const AllScreen: React.FC = () => {
  return (
    <AllScreenWrapper>
      <View viewType={ViewType.All} />
    </AllScreenWrapper>
  );
};
