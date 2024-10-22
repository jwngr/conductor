import styled from 'styled-components';

import {AppHeader} from '@src/components/AppHeader';
import {FlexColumn, FlexRow} from '@src/components/atoms/Flex';
import {ScreenMainContentWrapper, ScreenWrapper} from '@src/components/layout/Screen';
import {LeftSidebar} from '@src/components/LeftSidebar';

const FeedsScreenMainContentWrapper = styled(FlexColumn)`
  flex: 1;
  padding: 20px;
  overflow: auto;
`;

const FeedsListWrapper = styled(FlexColumn)`
  border: 1px solid red;
  padding: 20px;
`;

export const FeedsList: React.FC = () => {
  return (
    <FeedsListWrapper>
      <h2>TODO</h2>
    </FeedsListWrapper>
  );
};

const FeedAdderWrapper = styled(FlexRow)`
  border: 1px solid blue;
  padding: 20px;
`;

const FeedAdder: React.FC = () => {
  return <FeedAdderWrapper>TODO</FeedAdderWrapper>;
};

export const FeedsScreen: React.FC = () => {
  return (
    <ScreenWrapper>
      <AppHeader />
      <ScreenMainContentWrapper>
        <LeftSidebar />
        <FeedsScreenMainContentWrapper>
          <h2>Feeds</h2>
          <FeedsList />
          <FeedAdder />
        </FeedsScreenMainContentWrapper>
      </ScreenMainContentWrapper>
    </ScreenWrapper>
  );
};
