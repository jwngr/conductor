import React from 'react';

import {VideoFeedItem} from '@shared/types/feedItems';

import {FeedItemHeader, FeedItemWrapper} from '@src/components/feedItems/FeedItem';

export const VideoFeedItemComponent: React.FC<{readonly feedItem: VideoFeedItem}> = ({
  feedItem,
}) => {
  return (
    <FeedItemWrapper>
      <FeedItemHeader feedItem={feedItem} />
      <pre>{JSON.stringify(feedItem, null, 2)}</pre>
    </FeedItemWrapper>
  );
};
