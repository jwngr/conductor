import type React from 'react';

import type {VideoFeedItem} from '@shared/types/feedItems.types';

import {Text} from '@src/components/atoms/Text';
import {FeedItemHeader, FeedItemWrapper} from '@src/components/feedItems/FeedItem';
import {ImportingFeedItem} from '@src/components/feedItems/ImportingFeedItem';

export const VideoFeedItemComponent: React.FC<{readonly feedItem: VideoFeedItem}> = ({
  feedItem,
}) => {
  const hasFeedItemEverBeenImported = feedItem.importState.lastSuccessfulImportTime !== null;

  let mainContent: React.ReactNode;
  if (!hasFeedItemEverBeenImported) {
    mainContent = <ImportingFeedItem feedItem={feedItem} />;
  } else {
    mainContent = <Text as="p">TODO</Text>;
  }

  return (
    <FeedItemWrapper>
      <FeedItemHeader feedItem={feedItem} />
      {mainContent}
    </FeedItemWrapper>
  );
};
