import type React from 'react';

import type {XkcdFeedItem} from '@shared/types/feedItems.types';

import {getXkcdFeedItemImageUrl} from '@sharedClient/services/feedItems.client';

import {FeedItemHeader, FeedItemWrapper} from '@src/components/feedItems/FeedItem';
import {ImportingFeedItem} from '@src/components/feedItems/ImportingFeedItem';

const XkcdImage: React.FC<{readonly feedItem: XkcdFeedItem}> = ({feedItem}) => {
  // TODO: Add alt text.
  return <img src={getXkcdFeedItemImageUrl(feedItem)} />;
};

export const XkcdFeedItemComponent: React.FC<{readonly feedItem: XkcdFeedItem}> = ({feedItem}) => {
  const hasFeedItemEverBeenImported = feedItem.importState.lastSuccessfulImportTime !== null;

  let mainContent: React.ReactNode;
  if (!hasFeedItemEverBeenImported) {
    mainContent = <ImportingFeedItem feedItem={feedItem} />;
  } else {
    mainContent = <XkcdImage feedItem={feedItem} />;
  }

  return (
    <FeedItemWrapper>
      <FeedItemHeader feedItem={feedItem} />
      {mainContent}
    </FeedItemWrapper>
  );
};
