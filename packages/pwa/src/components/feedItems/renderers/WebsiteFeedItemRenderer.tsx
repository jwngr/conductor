import type React from 'react';

import {SharedFeedItemHelpers} from '@shared/lib/feedItems.shared';

import type {WebsiteFeedItem} from '@shared/types/feedItems.types';

import {FeedItemHeader, FeedItemSummary, FeedItemWrapper} from '@src/components/feedItems/FeedItem';
import {FeedItemMarkdown} from '@src/components/feedItems/FeedItemMarkdown';
import {ImportingFeedItem} from '@src/components/feedItems/ImportingFeedItem';

export const WebsiteFeedItemRenderer: React.FC<{readonly feedItem: WebsiteFeedItem}> = ({
  feedItem,
}) => {
  const hasFeedItemEverBeenImported = SharedFeedItemHelpers.hasEverBeenImported(feedItem);

  let mainContent: React.ReactNode;
  if (!hasFeedItemEverBeenImported) {
    mainContent = <ImportingFeedItem feedItem={feedItem} />;
  } else {
    mainContent = (
      <>
        <FeedItemSummary feedItem={feedItem} />
        <FeedItemMarkdown feedItem={feedItem} />
      </>
    );
  }

  return (
    <FeedItemWrapper>
      <FeedItemHeader feedItem={feedItem} />
      {mainContent}
    </FeedItemWrapper>
  );
};
