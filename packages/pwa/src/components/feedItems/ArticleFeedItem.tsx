import type React from 'react';

import type {ArticleFeedItem} from '@shared/types/feedItems.types';

import {FeedItemHeader, FeedItemSummary, FeedItemWrapper} from '@src/components/feedItems/FeedItem';
import {FeedItemMarkdown} from '@src/components/feedItems/FeedItemMarkdown';
import {ImportingFeedItem} from '@src/components/feedItems/ImportingFeedItem';

export const ArticleFeedItemComponent: React.FC<{readonly feedItem: ArticleFeedItem}> = ({
  feedItem,
}) => {
  const hasFeedItemEverBeenImported = feedItem.importState.lastSuccessfulImportTime !== null;

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
