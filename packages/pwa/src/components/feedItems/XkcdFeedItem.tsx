import type React from 'react';

import type {XkcdFeedItem} from '@shared/types/feedItems.types';

import {getXkcdFeedItemImageUrl} from '@sharedClient/services/feedItems.client';

import {FeedItemHeader, FeedItemWrapper} from '@src/components/feedItems/FeedItem';

const XkcdImage: React.FC<{readonly feedItem: XkcdFeedItem}> = ({feedItem}) => {
  // TODO: Add alt text.
  return <img src={getXkcdFeedItemImageUrl(feedItem)} />;
};

export const XkcdFeedItemComponent: React.FC<{readonly feedItem: XkcdFeedItem}> = ({feedItem}) => {
  return (
    <FeedItemWrapper>
      <FeedItemHeader feedItem={feedItem} />
      <XkcdImage feedItem={feedItem} />
    </FeedItemWrapper>
  );
};
