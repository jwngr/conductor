import type React from 'react';

import type {YouTubeFeedItem} from '@shared/types/feedItems.types';

import {useYouTubeFeedItemTranscript} from '@sharedClient/services/feedItems.client';

import {Text} from '@src/components/atoms/Text';
import {ImportingFeedItem} from '@src/components/feedItems/ImportingFeedItem';
import {Markdown} from '@src/components/Markdown';

import {FeedItemHeader, FeedItemWrapper} from './FeedItem';
import {FeedItemMarkdown} from './FeedItemMarkdown';

const ImportedYouTubeFeedItemTranscript: React.FC<{readonly feedItem: YouTubeFeedItem}> = ({
  feedItem,
}) => {
  const transcriptState = useYouTubeFeedItemTranscript(feedItem);

  if (transcriptState.error) {
    return (
      <Text as="p" className="text-error">
        Error loading transcript: {transcriptState.error.message}
      </Text>
    );
  }

  if (transcriptState.isLoading) {
    return <Text as="p">Loading transcript...</Text>;
  }

  if (transcriptState.contents) {
    return <Markdown content={transcriptState.contents} />;
  }

  return <Text as="p">No transcript</Text>;
};

const YouTubeFeedItemTranscript: React.FC<{readonly feedItem: YouTubeFeedItem}> = ({feedItem}) => {
  const hasFeedItemEverBeenImported = feedItem.importState.lastSuccessfulImportTime !== null;

  if (hasFeedItemEverBeenImported) {
    return <ImportedYouTubeFeedItemTranscript feedItem={feedItem} />;
  }

  return <ImportingFeedItem feedItem={feedItem} />;
};

export const YouTubeFeedItemComponent: React.FC<{readonly feedItem: YouTubeFeedItem}> = ({
  feedItem,
}) => {
  return (
    <FeedItemWrapper>
      <FeedItemHeader feedItem={feedItem} />
      <YouTubeFeedItemTranscript feedItem={feedItem} />
    </FeedItemWrapper>
  );
};
