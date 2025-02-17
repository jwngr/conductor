import type React from 'react';

import {logger} from '@shared/services/logger.shared';

import {prefixError} from '@shared/lib/errorUtils.shared';
import {SharedFeedItemHelpers} from '@shared/lib/feedItems.shared';

import type {FeedItem} from '@shared/types/feedItems.types';

import {useFeedItemMarkdown} from '@sharedClient/services/feedItems.client';

import {Text} from '@src/components/atoms/Text';
import {Markdown} from '@src/components/Markdown';

export const FeedItemMarkdown: React.FC<{readonly feedItem: FeedItem}> = ({feedItem}) => {
  const isFeedItemImported = !SharedFeedItemHelpers.isImporting(feedItem);
  const {markdown, isLoading, error} = useFeedItemMarkdown(feedItem.feedItemId, isFeedItemImported);

  if (error) {
    logger.error(prefixError(error, 'Error fetching markdown for feed item'), {
      feedItemId: feedItem.feedItemId,
    });
    // TODO: Introduce proper error screen.
    return <Text as="p">Something went wrong: {error.message}</Text>;
  } else if (!isFeedItemImported) {
    return <Text as="p">Importing...</Text>;
  } else if (isLoading) {
    return <Text as="p">Loading markdown...</Text>;
  } else if (markdown) {
    return <Markdown content={markdown} />;
  } else {
    return <Text as="p">No markdown</Text>;
  }
};
