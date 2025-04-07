import {useEffect, useRef} from 'react';
import type React from 'react';

import {logger} from '@shared/services/logger.shared';

import {Urls} from '@shared/lib/urls.shared';
import {assertNever} from '@shared/lib/utils.shared';

import {
  FeedItemImportStatus,
  type FeedItem,
  type FeedItemImportState,
} from '@shared/types/feedItems.types';
import type {ViewType} from '@shared/types/query.types';

import {useFocusStore} from '@sharedClient/stores/FocusStore';

import {useFeedItems} from '@sharedClient/services/feedItems.client';

import {Badge} from '@src/components/atoms/Badge';
import {Link} from '@src/components/atoms/Link';
import {Text} from '@src/components/atoms/Text';
import {ViewKeyboardShortcutHandler} from '@src/components/views/ViewKeyboardShortcutHandler';

const ViewListItemImportStatusBadge: React.FC<{
  readonly importState: FeedItemImportState;
}> = ({importState}) => {
  let badgeText: string | null;
  let badgeVariant: 'default' | 'destructive' | 'outline' | null = null;

  switch (importState.status) {
    case FeedItemImportStatus.New:
    case FeedItemImportStatus.NeedsRefresh:
      badgeText = 'Queued';
      badgeVariant = 'outline';
      break;
    case FeedItemImportStatus.Processing:
      badgeText = 'Processing';
      badgeVariant = 'outline';
      break;
    case FeedItemImportStatus.Completed:
      // Completed items have enough content to render already and don't need a badge.
      badgeText = null;
      badgeVariant = null;
      break;
    case FeedItemImportStatus.Failed:
      badgeText = 'Import Failed';
      badgeVariant = 'destructive';
      break;
    default:
      assertNever(importState);
  }

  if (!badgeText) {
    return null;
  }

  return <Badge variant={badgeVariant}>{badgeText}</Badge>;
};

const ViewListItem: React.FC<{
  readonly feedItem: FeedItem;
  readonly viewType: ViewType;
}> = ({feedItem}) => {
  const {focusedFeedItemId, setFocusedFeedItemId} = useFocusStore();
  const itemRef = useRef<HTMLDivElement>(null);

  const isFocused = focusedFeedItemId === feedItem.feedItemId;

  useEffect(() => {
    if (isFocused && itemRef.current) {
      itemRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [isFocused]);

  return (
    <Link to={Urls.forFeedItem(feedItem.feedItemId)}>
      <div
        ref={itemRef}
        className={`flex cursor-pointer flex-col justify-center gap-1 rounded p-2 outline-none hover:bg-neutral-100 focus-visible:bg-neutral-100 ${
          isFocused ? `bg-neutral-100 outline-2 outline-stone-500` : ''
        }`}
        tabIndex={0}
        onFocus={() => setFocusedFeedItemId(feedItem.feedItemId)}
        onBlur={() => setFocusedFeedItemId(null)}
      >
        <div className="flex items-center gap-2">
          <Text as="p" bold>
            {feedItem.title || 'No title'}
          </Text>
          <ViewListItemImportStatusBadge importState={feedItem.importState} />
        </div>
        <Text as="p" light>
          {feedItem.url}
        </Text>
      </div>
    </Link>
  );
};

const ViewList: React.FC<{viewType: ViewType}> = ({viewType}) => {
  const {feedItems, isLoading, error} = useFeedItems({viewType});

  if (isLoading) {
    // TODO: Introduce proper loading screen.
    return <div>Loading...</div>;
  }

  if (error) {
    // TODO: Introduce proper error screen.
    logger.error(new Error('Error loading feed items'), {error, viewType});
    return <div>Error: {error.message}</div>;
  }

  if (feedItems.length === 0) {
    // TODO: Introduce proper empty state screen.
    return <div>No items</div>;
  }

  return (
    <>
      <ul>
        {feedItems.map((feedItem) => (
          <ViewListItem key={feedItem.feedItemId} feedItem={feedItem} viewType={viewType} />
        ))}
      </ul>
      <ViewKeyboardShortcutHandler feedItems={feedItems} />
    </>
  );
};

export const View: React.FC<{viewType: ViewType}> = ({viewType}) => {
  return (
    <div className="flex flex-1 flex-col overflow-auto p-5">
      <h2>{viewType}</h2>
      <ViewList viewType={viewType} />
    </div>
  );
};
