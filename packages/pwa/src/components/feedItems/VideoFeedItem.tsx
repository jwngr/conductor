import React from 'react';

import type {VideoFeedItem} from '@shared/types/feedItems.types';

import {Text} from '@src/components/atoms/Text';
import {FeedItemHeader, FeedItemWrapper} from '@src/components/feedItems/FeedItem';

export const VideoFeedItemComponent: React.FC<{readonly feedItem: VideoFeedItem}> = ({
  feedItem,
}) => {
  return (
    <FeedItemWrapper>
      <FeedItemHeader feedItem={feedItem} />
      <Text as="p">TODO</Text>
    </FeedItemWrapper>
  );
};
