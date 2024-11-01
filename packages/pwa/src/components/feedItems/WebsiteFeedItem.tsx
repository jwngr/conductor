import React from 'react';

import {WebsiteFeedItem} from '@shared/types/feedItems';

import {FeedItemHeader, FeedItemWrapper} from './FeedItem';
import {FeedItemMarkdown} from './FeedItemMarkdown';

export const WebsiteFeedItemComponent: React.FC<{readonly feedItem: WebsiteFeedItem}> = ({
  feedItem,
}) => {
  return (
    <FeedItemWrapper>
      <FeedItemHeader feedItem={feedItem} />
      <pre>{JSON.stringify(feedItem, null, 2)}</pre>
      <br />
      <FeedItemMarkdown feedItem={feedItem} />
    </FeedItemWrapper>
  );
};
