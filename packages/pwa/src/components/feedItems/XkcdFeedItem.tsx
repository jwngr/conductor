import React from 'react';

import {XkcdFeedItem} from '@shared/types/feedItems';

import {FeedItemHeader, FeedItemWrapper} from './FeedItem';
import {FeedItemMarkdown} from './FeedItemMarkdown';

export const XkcdFeedItemComponent: React.FC<{readonly feedItem: XkcdFeedItem}> = ({feedItem}) => {
  return (
    <FeedItemWrapper>
      <FeedItemHeader feedItem={feedItem} />
      <pre>{JSON.stringify(feedItem, null, 2)}</pre>
      <br />
      <FeedItemMarkdown feedItem={feedItem} />
    </FeedItemWrapper>
  );
};
