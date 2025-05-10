import type React from 'react';

import {SharedFeedItemHelpers} from '@shared/lib/feedItems.shared';
import {assertNever} from '@shared/lib/utils.shared';

import {AsyncStatus} from '@shared/types/asyncState.types';
import type {YouTubeFeedItem} from '@shared/types/feedItems.types';

import {useYouTubeFeedItemTranscript} from '@sharedClient/services/feedItems.client';

import {Text} from '@src/components/atoms/Text';
import {FeedItemHeader, FeedItemWrapper} from '@src/components/feedItems/FeedItem';
import {ImportingFeedItem} from '@src/components/feedItems/ImportingFeedItem';
import {Markdown} from '@src/components/Markdown';

const YouTubeFeedItemTranscript: React.FC<{readonly feedItem: YouTubeFeedItem}> = ({feedItem}) => {
  const transcriptState = useYouTubeFeedItemTranscript(feedItem);

  switch (transcriptState.status) {
    case AsyncStatus.Idle:
    case AsyncStatus.Pending:
      return <Text as="p">Loading transcript...</Text>;
    case AsyncStatus.Error:
      return (
        <Text as="p" className="text-error">
          Error loading transcript: {transcriptState.error.message}
        </Text>
      );
    case AsyncStatus.Success:
      return <Markdown content={transcriptState.value} />;
    default:
      assertNever(transcriptState);
  }
};

export const YouTubeFeedItemRenderer: React.FC<{readonly feedItem: YouTubeFeedItem}> = ({
  feedItem,
}) => {
  const hasFeedItemEverBeenImported = SharedFeedItemHelpers.hasEverBeenImported(feedItem);

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
