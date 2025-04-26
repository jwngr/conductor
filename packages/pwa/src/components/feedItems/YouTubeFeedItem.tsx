import type React from 'react';

import type {YouTubeFeedItem} from '@shared/types/feedItems.types';

import {useYouTubeFeedItemTranscript} from '@sharedClient/services/feedItems.client';

import {Text} from '@src/components/atoms/Text';
import {FeedItemHeader, FeedItemWrapper} from '@src/components/feedItems/FeedItem';
import {ImportingFeedItem} from '@src/components/feedItems/ImportingFeedItem';
import {Markdown} from '@src/components/Markdown';

const YouTubeFeedItemTranscript: React.FC<{readonly feedItem: YouTubeFeedItem}> = ({feedItem}) => {
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

  if (transcriptState.content) {
    return <Markdown content={transcriptState.content} />;
  }

  return <Text as="p">No transcript</Text>;
};

export const YouTubeFeedItemComponent: React.FC<{readonly feedItem: YouTubeFeedItem}> = ({
  feedItem,
}) => {
  const hasFeedItemEverBeenImported = feedItem.importState.lastSuccessfulImportTime !== null;

  let mainContent: React.ReactNode;
  if (!hasFeedItemEverBeenImported) {
    mainContent = <ImportingFeedItem feedItem={feedItem} />;
  } else {
    mainContent = <YouTubeFeedItemTranscript feedItem={feedItem} />;
  }

  return (
    <FeedItemWrapper>
      <FeedItemHeader feedItem={feedItem} />
      {mainContent}
    </FeedItemWrapper>
  );
};
