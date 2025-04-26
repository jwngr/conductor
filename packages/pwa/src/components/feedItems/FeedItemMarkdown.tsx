import type React from 'react';

import type {FeedItem} from '@shared/types/feedItems.types';

import {useFeedItemMarkdown} from '@sharedClient/services/feedItems.client';

import {Text} from '@src/components/atoms/Text';
import {ImportingFeedItem} from '@src/components/feedItems/ImportingFeedItem';
import {Markdown} from '@src/components/Markdown';

const ImportedFeedItemMarkdown: React.FC<{readonly feedItem: FeedItem}> = ({feedItem}) => {
  const markdownState = useFeedItemMarkdown(feedItem);

  if (markdownState.error) {
    return (
      <Text as="p" className="text-error">
        Error loading markdown: {markdownState.error.message}
      </Text>
    );
  }

  if (markdownState.isLoading) {
    return <Text as="p">Loading markdown...</Text>;
  }

  if (markdownState.content) {
    return <Markdown content={markdownState.content} />;
  }

  return <Text as="p">No markdown</Text>;
};

export const FeedItemMarkdown: React.FC<{readonly feedItem: FeedItem}> = ({feedItem}) => {
  const hasFeedItemEverBeenImported = feedItem.importState.lastSuccessfulImportTime !== null;

  if (hasFeedItemEverBeenImported) {
    return <ImportedFeedItemMarkdown feedItem={feedItem} />;
  }

  return <ImportingFeedItem feedItem={feedItem} />;
};
