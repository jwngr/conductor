import React, {useEffect, useMemo, useRef, useState} from 'react';

import {logger} from '@shared/services/logger.shared';

import {arrayFilter} from '@shared/lib/arrayUtils.shared';
import {isDate} from '@shared/lib/datetime.shared';
import {prefixError} from '@shared/lib/errorUtils.shared';
import {getFeedSubscriptionIdForItem, SharedFeedItemHelpers} from '@shared/lib/feedItems.shared';
import {objectKeys, objectMapEntries} from '@shared/lib/objectUtils.shared';
import {assertNever} from '@shared/lib/utils.shared';
import {Views} from '@shared/lib/views.shared';

import {AsyncStatus} from '@shared/types/asyncState.types';
import {FeedItemContentType} from '@shared/types/feedItems.types';
import type {FeedItem, FeedItemId} from '@shared/types/feedItems.types';
import type {FeedType} from '@shared/types/feedSourceTypes.types';
import type {FeedSubscriptionId} from '@shared/types/feedSubscriptions.types';
import type {TagId} from '@shared/types/tags.types';
import type {Supplier} from '@shared/types/utils.types';
import type {ViewGroupByOption, ViewSortByOption, ViewType} from '@shared/types/views.types';
import {ViewGroupByField, ViewSortByField} from '@shared/types/views.types';

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
import {H3, P} from '@src/components/atoms/Text';
import {ErrorArea} from '@src/components/errors/ErrorArea';
import {HoverFeedItemActions} from '@src/components/feedItems/FeedItemActions';
import {FeedItemImportStatusBadge} from '@src/components/feedItems/FeedItemImportStatusBadge';
import {FeedItemKeyboardShortcutHandler} from '@src/components/feedItems/FeedItemKeyboardShortcutHandler';
import {LoadingArea} from '@src/components/loading/LoadingArea';
import {UntriagedViewControlsSidebar} from '@src/components/views/UntriagedViewControlsSidebar';
import * as styles from '@src/components/views/View.css';
import {ViewKeyboardShortcutHandler} from '@src/components/views/ViewKeyboardShortcutHandler';

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
    case ViewSortByField.CreatedTime:
      valA = a.createdTime;
      valB = b.createdTime;
      break;
    case ViewSortByField.LastUpdatedTime:
      valA = a.lastUpdatedTime;
      valB = b.lastUpdatedTime;
      break;
    case ViewSortByField.Title:
      valA = a.content.title;
      valB = b.content.title;
      break;
    default:
      assertNever(field);
  }

  // Handle date sorting.
  if (field === ViewSortByField.CreatedTime || field === ViewSortByField.LastUpdatedTime) {
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

function useFilteredFeedItems(
  feedItems: FeedItem[],
  filterByOptions: {
    readonly feedTypesToFilterBy: Set<FeedType>;
    readonly contentTypesToFilterBy: Set<FeedItemContentType>;
    readonly tagIdsToFilterBy: Set<TagId>;
    readonly subscriptionIdsToFilterBy: Set<FeedSubscriptionId>;
  }
): FeedItem[] {
  return useMemo(() => {
    return arrayFilter(feedItems, (item) => {
      const passesSourceTypeFilter =
        filterByOptions.feedTypesToFilterBy.size === 0 ||
        filterByOptions.feedTypesToFilterBy.has(item.origin.feedType);

      const passesContentTypeFilter =
        filterByOptions.contentTypesToFilterBy.size === 0 ||
        filterByOptions.contentTypesToFilterBy.has(item.feedItemContentType);

      // Feed subscription filter.
      const feedSubscriptionId = getFeedSubscriptionIdForItem(item);
      const passesSubscriptionFilter =
        filterByOptions.subscriptionIdsToFilterBy.size === 0 ||
        (feedSubscriptionId
          ? filterByOptions.subscriptionIdsToFilterBy.has(feedSubscriptionId)
          : false);

      // Tag filter.
      const feedItemTagIds = objectKeys(item.tagIds);
      const passesTagFilter =
        filterByOptions.tagIdsToFilterBy.size === 0 ||
        feedItemTagIds.some((tagId) => filterByOptions.tagIdsToFilterBy.has(tagId));

      // Only include feed items that pass all filters. If no items are active for a filter, it is
      // considered passed.
      return (
        passesSourceTypeFilter &&
        passesContentTypeFilter &&
        passesSubscriptionFilter &&
        passesTagFilter
      );
    });
  }, [feedItems, filterByOptions]);
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
      case ViewGroupByField.FeedItemContentType:
        for (const item of feedItems) {
          const groupKey = item.feedItemContentType;
          if (!groupedItems[groupKey]) {
            groupedItems[groupKey] = [];
          }
          groupedItems[groupKey].push(item);
        }
        return groupedItems;

      case ViewGroupByField.FeedType:
        for (const item of feedItems) {
          const groupKey = item.origin.feedType;
          if (!groupedItems[groupKey]) {
            groupedItems[groupKey] = [];
          }
          groupedItems[groupKey].push(item);
        }
        return groupedItems;

      case ViewGroupByField.ImportState:
        for (const item of feedItems) {
          const groupKey = item.importState.status;
          if (!groupedItems[groupKey]) {
            groupedItems[groupKey] = [];
          }
          groupedItems[groupKey].push(item);
        }
        return groupedItems;

      case ViewGroupByField.CreatedTime:
        // TODO: Handle timezones.
        for (const item of feedItems) {
          const groupKey = getDateGroupKey(item.createdTime);
          if (!groupedItems[groupKey]) {
            groupedItems[groupKey] = [];
          }
          groupedItems[groupKey].push(item);
        }
        return groupedItems;

      case ViewGroupByField.LastUpdatedTime:
        // TODO: Handle timezones.
        for (const item of feedItems) {
          const groupKey = getDateGroupKey(item.lastUpdatedTime);
          if (!groupedItems[groupKey]) {
            groupedItems[groupKey] = [];
          }
          groupedItems[groupKey].push(item);
        }
        return groupedItems;

      case ViewGroupByField.TriageStatus:
        for (const item of feedItems) {
          const groupKey = item.triageStatus;
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

interface LoadedViewListState {
  readonly sortBy: ViewSortByOption[];
  readonly groupBy: ViewGroupByOption[];
  readonly feedTypesToFilterBy: Set<FeedType>;
  readonly contentTypesToFilterBy: Set<FeedItemContentType>;
  readonly tagIdsToFilterBy: Set<TagId>;
  readonly subscriptionIdsToFilterBy: Set<FeedSubscriptionId>;
}

const LoadedViewList: React.FC<{
  readonly viewType: ViewType;
  readonly feedItems: FeedItem[];
  readonly showSidebar: boolean;
  readonly selectedFeedItemId: FeedItemId | null;
}> = ({viewType, feedItems, showSidebar, selectedFeedItemId}) => {
  const defaultViewConfig = Views.get(viewType);

  const [viewOptions, setViewOptions] = useState<LoadedViewListState>(() => {
    // Create mutable copies for the initial state.
    return {
      sortBy: [...defaultViewConfig.sortBy],
      groupBy: [...defaultViewConfig.groupBy],
      feedTypesToFilterBy: new Set<FeedType>(),
      contentTypesToFilterBy: new Set<FeedItemContentType>(),
      tagIdsToFilterBy: new Set<TagId>(),
      subscriptionIdsToFilterBy: new Set<FeedSubscriptionId>(),
    };
  });

  const filteredItems = useFilteredFeedItems(feedItems, viewOptions);
  const sortedItems = useSortedFeedItems(filteredItems, viewOptions.sortBy);
  const groupByField = viewOptions.groupBy.length === 0 ? null : viewOptions.groupBy[0].field;
  const groupedItems = useGroupedFeedItems(sortedItems, groupByField);

  const handleFilterBySourceTypeChange = (criteria: FeedType): void => {
    setViewOptions((prev: LoadedViewListState) => {
      const newSet = new Set(prev.feedTypesToFilterBy);
      if (newSet.has(criteria)) {
        newSet.delete(criteria);
      } else {
        newSet.add(criteria);
      }
      return {...prev, feedTypesToFilterBy: newSet};
    });
  };

  const handleFilterByContentTypeChange = (criteria: FeedItemContentType): void => {
    setViewOptions((prev: LoadedViewListState) => {
      const newSet = new Set(prev.contentTypesToFilterBy);
      if (newSet.has(criteria)) {
        newSet.delete(criteria);
      } else {
        newSet.add(criteria);
      }
      return {...prev, contentTypesToFilterBy: newSet};
    });
  };

  const handleFilterByTagChange = (criteria: TagId): void => {
    setViewOptions((prev: LoadedViewListState) => {
      const newSet = new Set(prev.tagIdsToFilterBy);
      if (newSet.has(criteria)) {
        newSet.delete(criteria);
      } else {
        newSet.add(criteria);
      }
      return {...prev, tagIdsToFilterBy: newSet};
    });
  };

  const handleFilterBySubscriptionChange = (criteria: FeedSubscriptionId): void => {
    setViewOptions((prev: LoadedViewListState) => {
      const newSet = new Set(prev.subscriptionIdsToFilterBy);
      if (newSet.has(criteria)) {
        newSet.delete(criteria);
      } else {
        newSet.add(criteria);
      }
      return {...prev, subscriptionIdsToFilterBy: newSet};
    });
  };

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
  } else if (feedItems.length === 0) {
    // TODO: Introduce proper empty state.
    mainContent = <div>No items</div>;
  } else if (filteredItems.length === 0) {
    // TODO: Introduce proper empty state.
    mainContent = <div>No items matching filters</div>;
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
      <FlexColumn flex gap={4} padding={4}>
        {objectMapEntries(groupedItems, (groupKey, items) => (
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

  const controlsSidebar = showSidebar ? (
    <UntriagedViewControlsSidebar
      feedItems={feedItems}
      sortBy={viewOptions.sortBy}
      groupBy={viewOptions.groupBy}
      feedTypesToFilterBy={viewOptions.feedTypesToFilterBy}
      contentTypesToFilterBy={viewOptions.contentTypesToFilterBy}
      tagIdsToFilterBy={viewOptions.tagIdsToFilterBy}
      subscriptionIdsToFilterBy={viewOptions.subscriptionIdsToFilterBy}
      onSortByChange={(newSortBy) =>
        setViewOptions((prev) => ({
          ...prev,
          sortBy: [newSortBy],
        }))
      }
      onGroupByChange={(newGroupBy) =>
        setViewOptions((prev) => ({
          ...prev,
          groupBy: [{field: newGroupBy}],
        }))
      }
      onSourceTypeClick={handleFilterBySourceTypeChange}
      onContentTypeClick={handleFilterByContentTypeChange}
      onTagClick={handleFilterByTagChange}
      onSubscriptionClick={handleFilterBySubscriptionChange}
    />
  ) : null;

  return (
    <>
      <FlexRow align="stretch" className="h-full">
        {controlsSidebar}
        {mainContent}
      </FlexRow>
      <ViewKeyboardShortcutHandler feedItems={sortedItems} />
    </>
  );
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
export const ViewListIgnoringDelivery: React.FC<{
  readonly viewType: Exclude<ViewType, ViewType.Untriaged>;
  readonly selectedFeedItemId: FeedItemId | null;
}> = ({viewType, selectedFeedItemId}) => {
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
      logger.error(betterError, {viewType});
      return <ViewListErrorArea error={feedItemsState.error} />;
    }
    case AsyncStatus.Success: {
      return (
        <LoadedViewList
          viewType={viewType}
          feedItems={feedItemsState.value}
          showSidebar={false}
          selectedFeedItemId={selectedFeedItemId}
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
export const ViewListRespectingDelivery: React.FC<{
  readonly viewType: ViewType.Untriaged;
  readonly selectedFeedItemId: FeedItemId | null;
}> = ({viewType, selectedFeedItemId}) => {
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
      logger.error(betterError, {viewType});
      return <ViewListErrorArea error={feedItemsState.error} />;
    }
    case AsyncStatus.Success: {
      return (
        <LoadedViewList
          viewType={viewType}
          feedItems={feedItemsState.value}
          showSidebar
          selectedFeedItemId={selectedFeedItemId}
        />
      );
    }
    default:
      assertNever(feedItemsState);
  }
};
