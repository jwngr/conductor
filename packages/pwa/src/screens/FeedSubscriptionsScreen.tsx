import styled from 'styled-components';

import {AppHeader} from '@src/components/AppHeader';
import {FlexColumn, FlexRow} from '@src/components/atoms/Flex';
import {ScreenMainContentWrapper, ScreenWrapper} from '@src/components/layout/Screen';
import {LeftSidebar} from '@src/components/LeftSidebar';

const FeedSubscriptionsScreenMainContentWrapper = styled(FlexColumn)`
  flex: 1;
  padding: 20px;
  overflow: auto;
`;

const FeedSubscriptionsListWrapper = styled(FlexColumn)`
  border: 1px solid red;
  padding: 20px;
`;

export const FeedSubscriptionsList: React.FC = () => {
  return (
    <FeedSubscriptionsListWrapper>
      <h2>TODO</h2>
    </FeedSubscriptionsListWrapper>
  );
};

const FeedAdderWrapper = styled(FlexRow)`
  border: 1px solid blue;
  padding: 20px;
`;

const FeedAdder: React.FC = () => {
  return <FeedAdderWrapper>TODO</FeedAdderWrapper>;
};

export const FeedSubscriptionsScreen: React.FC = () => {
  return (
    <ScreenWrapper>
      <AppHeader />
      <ScreenMainContentWrapper>
        <LeftSidebar />
        <FeedSubscriptionsScreenMainContentWrapper>
          <h2>Feeds</h2>
          <FeedSubscriptionsList />
          <FeedAdder />
        </FeedSubscriptionsScreenMainContentWrapper>
      </ScreenMainContentWrapper>
    </ScreenWrapper>
  );
};
