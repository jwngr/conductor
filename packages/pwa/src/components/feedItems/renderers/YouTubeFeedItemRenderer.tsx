import type React from 'react';

import {SharedFeedItemHelpers} from '@shared/lib/feedItems.shared';
import {assertNever} from '@shared/lib/utils.shared';

import {AsyncStatus} from '@shared/types/asyncState.types';
import type {YouTubeFeedItem} from '@shared/types/feedItems.types';

import {
  DEFAULT_ROUTE_HERO_PAGE_ACTION,
  REFRESH_HERO_PAGE_ACTION,
} from '@sharedClient/lib/heroActions.client';

import {useYouTubeFeedItemTranscript} from '@sharedClient/hooks/feedItems.hooks';

import {ErrorArea} from '@src/components/errors/ErrorArea';
import {FeedItemHeader, FeedItemWrapper} from '@src/components/feedItems/FeedItem';
import {ImportingFeedItem} from '@src/components/feedItems/ImportingFeedItem';
import {LoadingArea} from '@src/components/loading/LoadingArea';
import {Markdown} from '@src/components/Markdown';

const YouTubeFeedItemTranscript: React.FC<{readonly feedItem: YouTubeFeedItem}> = ({feedItem}) => {
  const transcriptState = useYouTubeFeedItemTranscript(feedItem);

  switch (transcriptState.status) {
    case AsyncStatus.Idle:
    case AsyncStatus.Pending:
      return <LoadingArea text="Loading transcript..." />;
    case AsyncStatus.Error:
      return (
        <ErrorArea
          error={transcriptState.error}
          title="Error loading transcript"
          subtitle="Refreshing may resolve the issue. If the problem persists, please contact support."
          actions={[DEFAULT_ROUTE_HERO_PAGE_ACTION, REFRESH_HERO_PAGE_ACTION]}
        />
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
