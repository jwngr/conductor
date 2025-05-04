import type React from 'react';

import {SharedFeedItemHelpers} from '@shared/lib/feedItems.shared';

import type {TweetFeedItem} from '@shared/types/feedItems.types';

import {Text} from '@src/components/atoms/Text';
import {FeedItemHeader, FeedItemWrapper} from '@src/components/feedItems/FeedItem';
import {ImportingFeedItem} from '@src/components/feedItems/ImportingFeedItem';

export const TweetFeedItemRenderer: React.FC<{readonly feedItem: TweetFeedItem}> = ({feedItem}) => {
  const hasFeedItemEverBeenImported = SharedFeedItemHelpers.hasEverBeenImported(feedItem);

  let mainContent: React.ReactNode;
  if (!hasFeedItemEverBeenImported) {
    mainContent = <ImportingFeedItem feedItem={feedItem} />;
  } else {
    mainContent = <Text as="p">TODO</Text>;
  }

  return (
    <FeedItemWrapper>
      <FeedItemHeader feedItem={feedItem} />
      {mainContent}
    </FeedItemWrapper>
  );
};
