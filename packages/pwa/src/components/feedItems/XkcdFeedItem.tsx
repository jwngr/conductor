import type React from 'react';

import {SharedFeedItemHelpers} from '@shared/lib/feedItems.shared';

import type {XkcdFeedItem} from '@shared/types/feedItems.types';

import {Text} from '@src/components/atoms/Text';
import {FeedItemHeader, FeedItemWrapper} from '@src/components/feedItems/FeedItem';
import {ImportingFeedItem} from '@src/components/feedItems/ImportingFeedItem';

const XkcdImageAndAltText: React.FC<{readonly feedItem: XkcdFeedItem}> = ({feedItem}) => {
  if (!feedItem.xkcd?.imageUrl) {
    return null;
  }
  return (
    <div className="flex flex-col gap-2">
      <img src={feedItem.xkcd.imageUrl} alt={feedItem.xkcd.altText} />
      <Text as="p">{feedItem.xkcd.altText ?? 'No alt text'}</Text>
    </div>
  );
};

export const XkcdFeedItemComponent: React.FC<{readonly feedItem: XkcdFeedItem}> = ({feedItem}) => {
  const hasFeedItemEverBeenImported = SharedFeedItemHelpers.hasEverBeenImported(feedItem);

  let mainContent: React.ReactNode;
  if (!hasFeedItemEverBeenImported) {
    mainContent = <ImportingFeedItem feedItem={feedItem} />;
  } else {
    mainContent = <XkcdImageAndAltText feedItem={feedItem} />;
  }

  return (
    <FeedItemWrapper>
      <FeedItemHeader feedItem={feedItem} />
      {mainContent}
    </FeedItemWrapper>
  );
};
