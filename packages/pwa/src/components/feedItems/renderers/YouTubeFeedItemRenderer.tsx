import type React from 'react';

import {assertNever} from '@shared/lib/utils.shared';

import {AsyncStatus} from '@shared/types/asyncState.types';
import type {YouTubeFeedItem} from '@shared/types/feedItems.types';

import {
  DEFAULT_ROUTE_HERO_PAGE_ACTION,
  REFRESH_HERO_PAGE_ACTION,
} from '@sharedClient/lib/heroActions.client';

import {useYouTubeFeedItemTranscript} from '@sharedClient/hooks/feedItems.hooks';

import {ErrorArea} from '@src/components/errors/ErrorArea';
import {SimpleFeedItemRenderer} from '@src/components/feedItems/FeedItem';
import {LoadingArea} from '@src/components/loading/LoadingArea';
import {Markdown} from '@src/components/Markdown';

import {firebaseService} from '@src/lib/firebase.pwa';

const YouTubeFeedItemTranscript: React.FC<{readonly feedItem: YouTubeFeedItem}> = ({feedItem}) => {
  const transcriptState = useYouTubeFeedItemTranscript({feedItem, firebaseService});

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
  return (
    <SimpleFeedItemRenderer feedItem={feedItem}>
      <YouTubeFeedItemTranscript feedItem={feedItem} />
    </SimpleFeedItemRenderer>
  );
};
