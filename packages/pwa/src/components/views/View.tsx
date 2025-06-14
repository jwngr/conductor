import React, {useEffect, useMemo, useRef, useState} from 'react';

import {logger} from '@shared/services/logger.shared';

import {isDate} from '@shared/lib/datetime.shared';
import {prefixError} from '@shared/lib/errorUtils.shared';
import {SharedFeedItemHelpers} from '@shared/lib/feedItems.shared';
import {assertNever} from '@shared/lib/utils.shared';
import {Views} from '@shared/lib/views.shared';

import {AsyncStatus} from '@shared/types/asyncState.types';
import {FeedItemContentType} from '@shared/types/feedItems.types';
import type {FeedItem, FeedItemId} from '@shared/types/feedItems.types';
import type {Supplier} from '@shared/types/utils.types';
import {ViewType} from '@shared/types/views.types';
import type {
  ViewGroupByField,
  ViewGroupByOption,
  ViewSortByField,
  ViewSortByOption,
} from '@shared/types/views.types';

import {useFocusStore} from '@sharedClient/stores/FocusStore';

import {
  DEFAULT_ROUTE_HERO_PAGE_ACTION,
  REFRESH_HERO_PAGE_ACTION,
} from '@sharedClient/lib/heroActions.client';

import {
  useFeedItemsIgnoringDelivery,
  useFeedItemsRespectingDelivery,
} from '@sharedClient/hooks/feedItems.hooks';

import {FlexColumn, FlexRow} from '@src/components/atoms/Flex';
import {Link} from '@src/components/atoms/Link';
import {H2, H3, P} from '@src/components/atoms/Text';
import {ErrorArea} from '@src/components/errors/ErrorArea';
import {HoverFeedItemActions} from '@src/components/feedItems/FeedItemActions';
import {FeedItemImportStatusBadge} from '@src/components/feedItems/FeedItemImportStatusBadge';
import {FeedItemKeyboardShortcutHandler} from '@src/components/feedItems/FeedItemKeyboardShortcutHandler';
import {LoadingArea} from '@src/components/loading/LoadingArea';
import * as styles from '@src/components/views/View.css';
import {ViewKeyboardShortcutHandler} from '@src/components/views/ViewKeyboardShortcutHandler';
import {ViewOptionsDialog} from '@src/components/views/ViewOptionsDialog';

import {firebaseService} from '@src/lib/firebase.pwa';
import {getRouteFromViewType} from '@src/lib/router.pwa';

import {FeedItemScreenContent} from '@src/screens/FeedItemScreen';

function compareFeedItems(args: {
  readonly a: FeedItem;
  readonly b: FeedItem;
  readonly field: ViewSortByField;
  readonly direction: 1 | -1;
}): number {
  const {a, b, field, direction} = args;

  let valA: string | number | Date;
  let valB: string | number | Date;

  switch (field) {
    case 'createdTime':
      valA = a.createdTime;
      valB = b.createdTime;
      break;
    case 'lastUpdatedTime':
      valA = a.lastUpdatedTime;
      valB = b.lastUpdatedTime;
      break;
    case 'title':
      valA = a.content.title;
      valB = b.content.title;
      break;
    default:
      assertNever(field);
  }

  // Handle date sorting.
  if (field === 'createdTime' || field === 'lastUpdatedTime') {
    valA = valA instanceof Date ? valA.getTime() : new Date(valA).getTime();
    valB = valB instanceof Date ? valB.getTime() : new Date(valB).getTime();
  }

  // Handle string comparison.
  if (typeof valA === 'string' && typeof valB === 'string') {
    return valA.localeCompare(valB) * direction;
  }

  // Basic comparison for numbers/other types.
  if (valA < valB) return -direction;
  if (valA > valB) return direction;
  return 0;
}

/**
 * Returns a sorted list of feed items based on multiple sort criteria. If multiple items are equal
 * based on the first criterion, the next criterion is used, and so on.
 */
function useSortedFeedItems(
  feedItems: FeedItem[],
  sortBy: readonly ViewSortByOption[]
): FeedItem[] {
  const sortedItems = useMemo(
    () =>
      // Create a shallow copy to avoid mutating the original array.
      [...feedItems].sort((a, b) => {
        for (const sortOption of sortBy) {
          const {field, direction: sortDirection} = sortOption;
          const direction = sortDirection === 'asc' ? 1 : -1;
          const comparison = compareFeedItems({a, b, field, direction});

          // If the items differ based on the current criterion, return the result. Otherwise,
          // continue to the next criterion.
          if (comparison !== 0) return comparison;
        }

        // If items are equal based on all criteria, maintain their original order.
        return 0;
      }),
    // Ensure the sorting re-runs when feedItems or the sortBy array changes.
    [feedItems, sortBy]
  );

  return sortedItems;
}

const getDateGroupKey = (rawDate: Date | string | {toDate: Supplier<Date>}): string => {
  let date: Date;
  if (isDate(rawDate)) {
    date = rawDate;
  } else if (typeof rawDate === 'string') {
    date = new Date(rawDate);
  } else {
    date = rawDate.toDate();
  }
  // TODO: Use better names for group keys.
  return date.toISOString().split('T')[0]; // YYYY-MM-DD format
};

/**
 * Returns a grouped list of feed items, keyed by values of the group field. Returns `null` if no
 * group field is provided.
 *
 * Note: Only supports a single level of grouping.
 */
function useGroupedFeedItems(
  feedItems: FeedItem[],
  groupByField: ViewGroupByField | null
): Record<string, FeedItem[]> | null {
  return useMemo(() => {
    if (groupByField === null) {
      return null;
    }

    const groupedItems: Record<string, FeedItem[]> = {};
    switch (groupByField) {
      case 'feedItemContentType':
        for (const item of feedItems) {
          const groupKey = item.feedItemContentType;
          if (!groupedItems[groupKey]) {
            groupedItems[groupKey] = [];
          }
          groupedItems[groupKey].push(item);
        }
        return groupedItems;

      case 'feedSourceType':
        for (const item of feedItems) {
          const groupKey = item.feedSource.feedSourceType;
          if (!groupedItems[groupKey]) {
            groupedItems[groupKey] = [];
          }
          groupedItems[groupKey].push(item);
        }
        return groupedItems;

      case 'importState':
        for (const item of feedItems) {
          const groupKey = item.importState.status;
          if (!groupedItems[groupKey]) {
            groupedItems[groupKey] = [];
          }
          groupedItems[groupKey].push(item);
        }
        return groupedItems;

      case 'createdTime':
        // TODO: Handle timezones.
        for (const item of feedItems) {
          const groupKey = getDateGroupKey(item.createdTime);
          if (!groupedItems[groupKey]) {
            groupedItems[groupKey] = [];
          }
          groupedItems[groupKey].push(item);
        }
        return groupedItems;

      case 'lastUpdatedTime':
        // TODO: Handle timezones.
        for (const item of feedItems) {
          const groupKey = getDateGroupKey(item.lastUpdatedTime);
          if (!groupedItems[groupKey]) {
            groupedItems[groupKey] = [];
          }
          groupedItems[groupKey].push(item);
        }
        return groupedItems;

      default:
        assertNever(groupByField);
    }
  }, [feedItems, groupByField]);
}

const ViewListItem: React.FC<{
  readonly feedItem: FeedItem;
  readonly viewType: ViewType;
}> = ({feedItem}) => {
  const {focusedFeedItemId, setFocusedFeedItemId} = useFocusStore();
  const itemRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const isUnread = SharedFeedItemHelpers.isUnread(feedItem);
  const isFocused = focusedFeedItemId === feedItem.feedItemId;
  const shouldShowActions = isHovered || isFocused;

  useEffect(() => {
    if (isFocused && itemRef.current) {
      itemRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [isFocused]);

  return (
    <Link search={{feedItemId: feedItem.feedItemId}}>
      <div
        ref={itemRef}
        className={styles.viewListItem({isFocused})}
        tabIndex={0}
        onFocus={() => setFocusedFeedItemId(feedItem.feedItemId)}
        onBlur={() => setFocusedFeedItemId(null)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div>
          <FlexRow gap={3}>
            <P bold={isUnread}>{feedItem.content.title || 'No title'}</P>
            <FeedItemImportStatusBadge importState={feedItem.importState} />
          </FlexRow>
          <P light>
            {feedItem.feedItemContentType === FeedItemContentType.Interval
              ? 'Interval'
              : feedItem.content.url}
          </P>
        </div>
        {shouldShowActions ? (
          <div className={styles.viewListItemActions()}>
            <HoverFeedItemActions feedItem={feedItem} />
          </div>
        ) : null}
      </div>
    </Link>
  );
};

const LoadedViewList: React.FC<{
  readonly viewType: ViewType;
  readonly feedItems: FeedItem[];
  readonly selectedFeedItemId: FeedItemId | null;
  readonly sortBy: readonly ViewSortByOption[];
  readonly groupBy: readonly ViewGroupByOption[];
}> = ({viewType, feedItems, selectedFeedItemId, sortBy, groupBy}) => {
  const sortedItems = useSortedFeedItems(feedItems, sortBy);
  const groupByField = groupBy.length === 0 ? null : groupBy[0].field;
  const groupedItems = useGroupedFeedItems(sortedItems, groupByField);

  if (feedItems.length === 0) {
    // TODO: Introduce proper empty state.
    return <div>No items</div>;
  }

  let mainContent: React.ReactNode;
  if (selectedFeedItemId) {
    // If a feed item is selected, render the feed item screen.
    const currentRoute = getRouteFromViewType(viewType);
    mainContent = (
      <>
        <FeedItemScreenContent feedItemId={selectedFeedItemId} />
        <FeedItemKeyboardShortcutHandler currentRoute={currentRoute} />
      </>
    );
  } else if (groupedItems === null) {
    // If no grouping is applied, just render the list of items.
    mainContent = (
      <ul>
        {sortedItems.map((feedItem) => (
          <ViewListItem key={feedItem.feedItemId} feedItem={feedItem} viewType={viewType} />
        ))}
      </ul>
    );
  } else {
    // If grouping is applied, render the list of items grouped by the group field.
    mainContent = (
      <FlexColumn gap={4}>
        {Object.entries(groupedItems).map(([groupKey, items]) => (
          <React.Fragment key={`${viewType}-${groupKey}`}>
            <H3>{groupKey}</H3>
            <ul>
              {items.map((feedItem) => (
                <ViewListItem key={feedItem.feedItemId} feedItem={feedItem} viewType={viewType} />
              ))}
            </ul>
          </React.Fragment>
        ))}
      </FlexColumn>
    );
  }

  return (
    <>
      {mainContent}
      <ViewKeyboardShortcutHandler feedItems={sortedItems} />
    </>
  );
};

const ViewList: React.FC<{
  readonly viewType: ViewType;
  readonly selectedFeedItemId: FeedItemId | null;
  readonly sortBy: readonly ViewSortByOption[];
  readonly groupBy: readonly ViewGroupByOption[];
}> = ({viewType, selectedFeedItemId, sortBy, groupBy}) => {
  // Split views based on whether or not they filter items based on delivery schedules. This is
  // because fetching delivery schedules is more expensive, so we want to avoid doing so for views
  // which do not need them.
  switch (viewType) {
    case ViewType.Untriaged:
      return (
        <ViewListRespectingDelivery
          viewType={viewType}
          selectedFeedItemId={selectedFeedItemId}
          sortBy={sortBy}
          groupBy={groupBy}
        />
      );
    case ViewType.Saved:
    case ViewType.Done:
    case ViewType.Trashed:
    case ViewType.Unread:
    case ViewType.Starred:
    case ViewType.All:
    case ViewType.Today:
      return (
        <ViewListIgnoringDelivery
          viewType={viewType}
          selectedFeedItemId={selectedFeedItemId}
          sortBy={sortBy}
          groupBy={groupBy}
        />
      );
    default:
      assertNever(viewType);
  }
};

const ViewListErrorArea: React.FC<{
  readonly error: Error;
}> = ({error}) => {
  return (
    <ErrorArea
      error={error}
      title="Failed to load items"
      subtitle="Refreshing may resolve the issue. If the problem persists, please contact support."
      actions={[DEFAULT_ROUTE_HERO_PAGE_ACTION, REFRESH_HERO_PAGE_ACTION]}
    />
  );
};

/**
 * Primary list component for views which do not filter items based on delivery schedules.
 */
const ViewListIgnoringDelivery: React.FC<{
  readonly viewType: Exclude<ViewType, ViewType.Untriaged>;
  readonly selectedFeedItemId: FeedItemId | null;
  readonly sortBy: readonly ViewSortByOption[];
  readonly groupBy: readonly ViewGroupByOption[];
}> = ({viewType, selectedFeedItemId, sortBy, groupBy}) => {
  const feedItemsState = useFeedItemsIgnoringDelivery({viewType, firebaseService});

  switch (feedItemsState.status) {
    case AsyncStatus.Idle:
    case AsyncStatus.Pending:
      return <LoadingArea text="Loading items..." />;
    case AsyncStatus.Error: {
      const betterError = prefixError(
        feedItemsState.error,
        'Failed to load items ignoring delivery schedules'
      );
      logger.error(betterError, {viewType, sortBy, groupBy});
      return <ViewListErrorArea error={feedItemsState.error} />;
    }
    case AsyncStatus.Success: {
      return (
        <LoadedViewList
          viewType={viewType}
          feedItems={feedItemsState.value}
          selectedFeedItemId={selectedFeedItemId}
          sortBy={sortBy}
          groupBy={groupBy}
        />
      );
    }
    default:
      assertNever(feedItemsState);
  }
};

/**
 * Primary list component for views which filter items based on delivery schedules.
 */
const ViewListRespectingDelivery: React.FC<{
  readonly viewType: ViewType.Untriaged;
  readonly selectedFeedItemId: FeedItemId | null;
  readonly sortBy: readonly ViewSortByOption[];
  readonly groupBy: readonly ViewGroupByOption[];
}> = ({viewType, selectedFeedItemId, sortBy, groupBy}) => {
  const feedItemsState = useFeedItemsRespectingDelivery({viewType, firebaseService});

  switch (feedItemsState.status) {
    case AsyncStatus.Idle:
    case AsyncStatus.Pending:
      return <LoadingArea text="Loading items..." />;
    case AsyncStatus.Error: {
      const betterError = prefixError(
        feedItemsState.error,
        'Failed to load items respecting delivery schedules'
      );
      logger.error(betterError, {viewType, sortBy, groupBy});
      return <ViewListErrorArea error={feedItemsState.error} />;
    }
    case AsyncStatus.Success: {
      return (
        <LoadedViewList
          viewType={viewType}
          feedItems={feedItemsState.value}
          selectedFeedItemId={selectedFeedItemId}
          sortBy={sortBy}
          groupBy={groupBy}
        />
      );
    }
    default:
      assertNever(feedItemsState);
  }
};

const ViewHeader: React.FC<{
  name: string;
  sortBy: readonly ViewSortByOption[];
  groupBy: readonly ViewGroupByOption[];
  onSortByChange: React.Dispatch<React.SetStateAction<ViewSortByOption[]>>;
  onGroupByChange: React.Dispatch<React.SetStateAction<ViewGroupByOption[]>>;
}> = ({name, sortBy, groupBy, onSortByChange, onGroupByChange}) => {
  return (
    <FlexRow justify="between">
      <H2 bold>{name}</H2>
      <FlexRow gap={2}>
        <ViewOptionsDialog
          sortBy={sortBy}
          groupBy={groupBy}
          onSortByChange={onSortByChange}
          onGroupByChange={onGroupByChange}
        />
      </FlexRow>
    </FlexRow>
  );
};

interface ViewRendererState {
  readonly sortBy: ViewSortByOption[];
  readonly groupBy: ViewGroupByOption[];
}

export const ViewRenderer: React.FC<{
  readonly viewType: ViewType;
  readonly selectedFeedItemId: FeedItemId | null;
}> = ({viewType, selectedFeedItemId}) => {
  const defaultViewConfig = Views.get(viewType);

  const [viewOptions, setViewOptions] = useState<ViewRendererState>(() => {
    // Create mutable copies for the initial state.
    return {
      sortBy: [...defaultViewConfig.sortBy],
      groupBy: [...defaultViewConfig.groupBy],
    };
  });

  return (
    <FlexColumn flex gap={2} padding={4} overflow="auto">
      <ViewHeader
        name={defaultViewConfig.name}
        sortBy={viewOptions.sortBy}
        groupBy={viewOptions.groupBy}
        onSortByChange={(newSortBy) =>
          setViewOptions((prev) => ({
            ...prev,
            sortBy: typeof newSortBy === 'function' ? newSortBy(prev.sortBy) : newSortBy,
          }))
        }
        onGroupByChange={(newGroupBy) =>
          setViewOptions((prev) => ({
            ...prev,
            groupBy: typeof newGroupBy === 'function' ? newGroupBy(prev.groupBy) : newGroupBy,
          }))
        }
      />
      <ViewList
        viewType={viewType}
        selectedFeedItemId={selectedFeedItemId}
        sortBy={viewOptions.sortBy}
        groupBy={viewOptions.groupBy}
      />
    </FlexColumn>
  );
};
