import React from 'react';

import type {XkcdFeedItem} from '@shared/types/feedItems.types';

import {FeedItemHeader, FeedItemWrapper} from '@src/components/feedItems/FeedItem';
import {FeedItemMarkdown} from '@src/components/feedItems/FeedItemMarkdown';

export const XkcdFeedItemComponent: React.FC<{readonly feedItem: XkcdFeedItem}> = ({feedItem}) => {
  return (
    <FeedItemWrapper>
      <FeedItemHeader feedItem={feedItem} />
      <FeedItemMarkdown feedItem={feedItem} />
    </FeedItemWrapper>
  );
};
