import React, {useEffect, useMemo, useRef, useState} from 'react';

import {logger} from '@shared/services/logger.shared';

import {SharedFeedItemHelpers} from '@shared/lib/feedItems.shared';
import {Urls} from '@shared/lib/urls.shared';
import {assertNever} from '@shared/lib/utils.shared';
import {Views} from '@shared/lib/views.shared';

import type {FeedItem} from '@shared/types/feedItems.types';
import type {
  ViewGroupByField,
  ViewGroupByOption,
  ViewSortByField,
  ViewSortByOption,
  ViewType,
} from '@shared/types/views.types';

import {useFocusStore} from '@sharedClient/stores/FocusStore';

import {useFeedItems} from '@sharedClient/services/feedItems.client';

import {Link} from '@src/components/atoms/Link';
import {Text} from '@src/components/atoms/Text';
import {HoverFeedItemActions} from '@src/components/feedItems/FeedItemActions';
import {FeedItemImportStatusBadge} from '@src/components/feedItems/FeedItemImportStatusBadge';
import {ViewKeyboardShortcutHandler} from '@src/components/views/ViewKeyboardShortcutHandler';
import {ViewOptionsDialog} from '@src/components/views/ViewOptionsDialog';

function compareFeedItems(args: {
  a: FeedItem;
  b: FeedItem;
  field: ViewSortByField;
  direction: 1 | -1;
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
      valA = a.title;
      valB = b.title;
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

const getDateGroupKey = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  // TODO: Use better names for group keys.
  return d.toISOString().split('T')[0]; // YYYY-MM-DD format
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
      case 'type':
        for (const item of feedItems) {
          const groupKey = item.type;
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

      case 'createdDate':
        // TODO: Handle timezones.
        for (const item of feedItems) {
          const groupKey = getDateGroupKey(item.createdTime);
          if (!groupedItems[groupKey]) {
            groupedItems[groupKey] = [];
          }
          groupedItems[groupKey].push(item);
        }
        return groupedItems;

      case 'lastUpdatedDate':
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
    <Link to="/items/$feedItemId" params={{feedItemId: feedItem.feedItemId}}>
      <div
        ref={itemRef}
        className={`hover:bg-neutral-1 focus-visible:bg-neutral-1 relative flex cursor-pointer flex-col justify-center gap-1 rounded p-2 outline-none ${
          isFocused ? `bg-neutral-1 outline-2 outline-stone-500` : ''
        }`}
        tabIndex={0}
        onFocus={() => setFocusedFeedItemId(feedItem.feedItemId)}
        onBlur={() => setFocusedFeedItemId(null)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div>
          <div className="flex items-center gap-2 pr-10">
            <Text as="p" bold={isUnread}>
              {feedItem.title || 'No title'}
            </Text>
            <FeedItemImportStatusBadge importState={feedItem.importState} />
          </div>
          <Text as="p" light>
            {feedItem.url}
          </Text>
        </div>
        {shouldShowActions ? (
          <div className="absolute top-1/2 right-2 -translate-y-1/2 transform">
            <HoverFeedItemActions feedItem={feedItem} />
          </div>
        ) : null}
      </div>
    </Link>
  );
};

const LoadedViewList: React.FC<{
  viewType: ViewType;
  feedItems: FeedItem[];
  sortBy: readonly ViewSortByOption[];
  groupBy: readonly ViewGroupByOption[];
}> = ({viewType, feedItems, sortBy, groupBy}) => {
  const sortedItems = useSortedFeedItems(feedItems, sortBy);
  const groupByField = groupBy.length === 0 ? null : groupBy[0].field;
  const groupedItems = useGroupedFeedItems(sortedItems, groupByField);

  if (feedItems.length === 0) {
    // TODO: Introduce proper empty state screen.
    return <div>No items</div>;
  }

  // Grouping logic.
  let mainContent: React.ReactNode;
  if (groupedItems === null) {
    mainContent = (
      <ul>
        {sortedItems.map((feedItem) => (
          <ViewListItem key={feedItem.feedItemId} feedItem={feedItem} viewType={viewType} />
        ))}
      </ul>
    );
  } else {
    mainContent = (
      <div className="flex flex-col gap-4">
        {Object.entries(groupedItems).map(([groupKey, items]) => (
          <React.Fragment key={`${viewType}-${groupKey}`}>
            <Text as="h3">{groupKey}</Text>
            <ul>
              {items.map((feedItem) => (
                <ViewListItem key={feedItem.feedItemId} feedItem={feedItem} viewType={viewType} />
              ))}
            </ul>
          </React.Fragment>
        ))}
      </div>
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
  viewType: ViewType;
  sortBy: readonly ViewSortByOption[];
  groupBy: readonly ViewGroupByOption[];
}> = ({viewType, sortBy, groupBy}) => {
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

  return (
    <LoadedViewList viewType={viewType} feedItems={feedItems} sortBy={sortBy} groupBy={groupBy} />
  );
};

const ViewHeader: React.FC<{
  name: string;
  sortBy: readonly ViewSortByOption[];
  groupBy: readonly ViewGroupByOption[];
  onSortByChange: React.Dispatch<React.SetStateAction<ViewSortByOption[]>>;
  onGroupByChange: React.Dispatch<React.SetStateAction<ViewGroupByOption[]>>;
}> = ({name, sortBy, groupBy, onSortByChange, onGroupByChange}) => {
  return (
    <div className="mb-4 flex items-center justify-between">
      <Text as="h2" bold>
        {name}
      </Text>
      <div className="flex items-center gap-2">
        <ViewOptionsDialog
          sortBy={sortBy}
          groupBy={groupBy}
          onSortByChange={onSortByChange}
          onGroupByChange={onGroupByChange}
        />
      </div>
    </div>
  );
};

interface ViewRendererState {
  sortBy: ViewSortByOption[];
  groupBy: ViewGroupByOption[];
}

export const ViewRenderer: React.FC<{
  viewType: ViewType;
}> = ({viewType}) => {
  const defaultViewConfig = Views.get(viewType);

  const [viewOptions, setViewOptions] = useState<ViewRendererState>(() => {
    // Create mutable copies for the initial state.
    return {
      sortBy: [...defaultViewConfig.sortBy],
      groupBy: [...defaultViewConfig.groupBy],
    };
  });

  return (
    <div className="flex flex-1 flex-col overflow-auto p-5">
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
      <ViewList viewType={viewType} sortBy={viewOptions.sortBy} groupBy={viewOptions.groupBy} />
    </div>
  );
};
