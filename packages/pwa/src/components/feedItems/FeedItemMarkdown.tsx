import React from 'react';

import {logger} from '@shared/lib/logger';

import {FeedItem} from '@shared/types/feedItems.types';

import {Text} from '@src/components/atoms/Text';
import {Markdown} from '@src/components/Markdown';

import {useFeedItemMarkdown} from '@src/lib/feedItems.pwa';

export const FeedItemMarkdown: React.FC<{readonly feedItem: FeedItem}> = ({feedItem}) => {
  const isFeedItemImported = Boolean(feedItem?.lastImportedTime);
  const {markdown, isLoading, error} = useFeedItemMarkdown(feedItem.feedItemId, isFeedItemImported);

  if (error) {
    logger.error('Error fetching markdown', {error});
    // TODO: Introduce proper error screen.
    return <Text as="p">There was a problem loading the content: {error.message}</Text>;
  } else if (isLoading) {
    return <Text as="p">Loading markdown...</Text>;
  } else if (markdown) {
    return <Markdown content={markdown} />;
  } else {
    return <Text as="p">No markdown</Text>;
  }
};
