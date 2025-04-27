import React, {useEffect, useRef, useState} from 'react';

import {logger} from '@shared/services/logger.shared';

import {Urls} from '@shared/lib/urls.shared';
import {assertNever} from '@shared/lib/utils.shared';
import {Views} from '@shared/lib/views.shared';

import type {FeedItem} from '@shared/types/feedItems.types';
import type {SortDirection} from '@shared/types/query.types';
import {SORT_BY_CREATED_TIME_DESC_OPTION} from '@shared/types/views.types';
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
import {FeedItemImportStatusBadge} from '@src/components/feedItems/FeedItemImportStatusBadge';
import {ViewKeyboardShortcutHandler} from '@src/components/views/ViewKeyboardShortcutHandler';

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
          <FeedItemImportStatusBadge importState={feedItem.importState} />
        </div>
        <Text as="p" light>
          {feedItem.url}
        </Text>
      </div>
    </Link>
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

  if (feedItems.length === 0) {
    // TODO: Introduce proper empty state screen.
    return <div>No items</div>;
  }

  // Sorting logic.
  const sortedItems = [...feedItems].sort((a, b) => {
    const firstSortByOption = sortBy[0] ?? SORT_BY_CREATED_TIME_DESC_OPTION;

    const field = firstSortByOption.field;
    const direction = firstSortByOption.direction === 'asc' ? 1 : -1;

    let valA: string | number | Date | null = null;
    let valB: string | number | Date | null = null;

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

    // Handle null/undefined values
    if (valA == null && valB == null) return 0;
    if (valA == null) return direction; // Sort nulls based on direction
    if (valB == null) return -direction;

    // Handle date sorting
    if (field === 'createdTime' || field === 'lastUpdatedTime') {
      valA = valA instanceof Date ? valA.getTime() : new Date(valA).getTime();
      valB = valB instanceof Date ? valB.getTime() : new Date(valB).getTime();
    }

    // Handle string comparison (case-insensitive)
    if (typeof valA === 'string' && typeof valB === 'string') {
      return valA.localeCompare(valB) * direction;
    }

    // Basic comparison for numbers/other
    if (valA < valB) return -direction;
    if (valA > valB) return direction;
    return 0;
  });

  // Grouping logic currently only supports a single group by field.
  const groupByField = groupBy.length === 0 ? null : groupBy[0].field;
  const groupedItems: Record<string, FeedItem[]> = {};
  switch (groupByField) {
    case null:
      groupedItems['all'] = sortedItems; // Group the sorted items
      break;

    case 'type':
      for (const item of sortedItems) {
        // Iterate over sorted items
        const groupKey = item.type || 'UNKNOWN';
        if (!groupedItems[groupKey]) {
          groupedItems[groupKey] = [];
        }
        groupedItems[groupKey].push(item);
      }
      break;

    case 'importState':
      for (const item of sortedItems) {
        // Iterate over sorted items
        const groupKey = item.importState?.status || 'UNKNOWN';
        if (!groupedItems[groupKey]) {
          groupedItems[groupKey] = [];
        }
        groupedItems[groupKey].push(item);
      }
      break;

    default:
      assertNever(groupByField);
  }

  console.log('--------------------------------');
  console.log('viewType', viewType);
  console.log('feedItems', feedItems);
  console.log('sortedItems', sortedItems);
  console.log('groupedItems', groupedItems);
  console.log('--------------------------------');

  return (
    <>
      {/* Render grouped items */}
      {Object.entries(groupedItems).map(([groupKey, items]) => (
        <React.Fragment key={groupKey}>
          {groupBy === null ? null : (
            <h3 className="mt-4 text-lg font-medium capitalize">{groupKey}</h3>
          )}
          <ul>
            {items.map((feedItem) => (
              <ViewListItem key={feedItem.feedItemId} feedItem={feedItem} viewType={viewType} />
            ))}
          </ul>
        </React.Fragment>
      ))}
      <ViewKeyboardShortcutHandler feedItems={sortedItems} />
    </>
  );
};

interface ViewRendererState {
  viewType: ViewType;
  sortBy: readonly ViewSortByOption[];
  groupBy: readonly ViewGroupByOption[];
}

export const ViewRenderer: React.FC<{
  viewType: ViewType;
}> = ({viewType}) => {
  const defaultViewConfig = Views.get(viewType);

  const [viewOptions, setViewOptions] = useState<ViewRendererState>(() => ({
    viewType,
    sortBy: defaultViewConfig.sortBy,
    groupBy: defaultViewConfig.groupBy,
  }));

  const firstSortByOption = viewOptions.sortBy[0] ?? SORT_BY_CREATED_TIME_DESC_OPTION;

  const handleGroupByChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    setViewOptions((prevOptions) => ({
      ...prevOptions,
      groupBy:
        event.target.value === 'none' ? [] : [{field: event.target.value as ViewGroupByField}],
    }));
  };

  const handleSortFieldChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    setViewOptions((prevOptions) => ({
      ...prevOptions,
      sortBy: [
        {
          field: event.target.value as ViewSortByField,
          direction: firstSortByOption.direction,
        },
      ],
    }));
  };

  const handleSortDirectionChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    setViewOptions((prevOptions) => ({
      ...prevOptions,
      sortBy: [
        {
          field: firstSortByOption.field,
          direction: event.target.value as SortDirection,
        },
      ],
    }));
  };

  return (
    <div className="flex flex-1 flex-col overflow-auto p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">{defaultViewConfig.name}</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <label htmlFor="groupBy">Group by:</label>
            <select
              id="groupBy"
              value={viewOptions.groupBy.length === 0 ? 'none' : viewOptions.groupBy[0].field}
              onChange={handleGroupByChange}
              className="rounded border border-stone-300 p-1"
            >
              <option value={'none'}>None</option>
              <option value={'type'}>Type</option>
              <option value={'importState'}>Import State</option>
            </select>
          </div>
          <div className="flex items-center gap-1">
            <label htmlFor="sortField">Sort by:</label>
            <select
              id="sortField"
              value={firstSortByOption.field}
              onChange={handleSortFieldChange}
              className="rounded border border-stone-300 p-1"
            >
              <option value={'createdTime'}>Date Created</option>
              <option value={'lastUpdatedTime'}>Date Updated</option>
              <option value={'title'}>Title</option>
            </select>
          </div>
          <div className="flex items-center gap-1">
            <select
              id="sortDirection"
              value={firstSortByOption.direction}
              onChange={handleSortDirectionChange}
              className="rounded border border-stone-300 p-1"
              aria-label="Sort direction"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
        </div>
      </div>
      <ViewList
        key={viewOptions.viewType}
        viewType={viewOptions.viewType}
        sortBy={viewOptions.sortBy}
        groupBy={viewOptions.groupBy}
      />
    </div>
  );
};
