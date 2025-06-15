import {assertNever} from '@shared/lib/utils.shared';

import type {FeedItem} from '@shared/types/feedItems.types';
import {TriageStatus} from '@shared/types/feedItems.types';
import {QueryFilterOp} from '@shared/types/query.types';
import {SystemTagId} from '@shared/types/tags.types';
import type {View, ViewGroupByOption, ViewSortByOption} from '@shared/types/views.types';
import {ViewGroupByField, ViewSortByField, ViewType} from '@shared/types/views.types';

export const GROUP_BY_CREATED_TIME_OPTION: ViewGroupByOption = {
  field: ViewGroupByField.CreatedTime,
};

const GROUP_BY_LAST_UPDATED_TIME_OPTION: ViewGroupByOption = {
  field: ViewGroupByField.LastUpdatedTime,
};

export const SORT_BY_CREATED_TIME_DESC_OPTION: ViewSortByOption = {
  field: ViewSortByField.CreatedTime,
  direction: 'desc',
};

export const SORT_BY_LAST_UPDATED_TIME_DESC_OPTION: ViewSortByOption = {
  field: ViewSortByField.LastUpdatedTime,
  direction: 'desc',
};

const ALL_VIEW_CONFIGS: Record<ViewType, View<FeedItem>> = {
  [ViewType.Untriaged]: {
    name: 'Untriaged',
    viewType: ViewType.Untriaged,
    filters: [{field: 'triageStatus', op: QueryFilterOp.Equals, value: TriageStatus.Untriaged}],
    sortBy: [SORT_BY_CREATED_TIME_DESC_OPTION],
    groupBy: [GROUP_BY_CREATED_TIME_OPTION],
  },
  [ViewType.Saved]: {
    name: 'Saved',
    viewType: ViewType.Saved,
    filters: [{field: 'triageStatus', op: QueryFilterOp.Equals, value: TriageStatus.Saved}],
    sortBy: [SORT_BY_LAST_UPDATED_TIME_DESC_OPTION],
    groupBy: [GROUP_BY_LAST_UPDATED_TIME_OPTION],
  },
  [ViewType.Done]: {
    name: 'Done',
    viewType: ViewType.Done,
    filters: [{field: 'triageStatus', op: QueryFilterOp.Equals, value: TriageStatus.Done}],
    sortBy: [SORT_BY_LAST_UPDATED_TIME_DESC_OPTION],
    groupBy: [GROUP_BY_LAST_UPDATED_TIME_OPTION],
  },
  [ViewType.Trashed]: {
    name: 'Trashed',
    viewType: ViewType.Trashed,
    filters: [{field: 'triageStatus', op: QueryFilterOp.Equals, value: TriageStatus.Trashed}],
    sortBy: [SORT_BY_LAST_UPDATED_TIME_DESC_OPTION],
    groupBy: [GROUP_BY_LAST_UPDATED_TIME_OPTION],
  },
  [ViewType.Unread]: {
    name: 'Unread',
    viewType: ViewType.Unread,
    filters: [
      // TODO: Fix the typecasting here.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      {field: `tagIds.${SystemTagId.Unread}` as any, op: QueryFilterOp.Equals, value: true},
    ],
    sortBy: [SORT_BY_CREATED_TIME_DESC_OPTION],
    groupBy: [GROUP_BY_CREATED_TIME_OPTION],
  },
  [ViewType.Starred]: {
    name: 'Starred',
    viewType: ViewType.Starred,
    filters: [
      // TODO: Fix the typecasting here.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      {field: `tagIds.${SystemTagId.Starred}` as any, op: QueryFilterOp.Equals, value: true},
    ],
    sortBy: [SORT_BY_CREATED_TIME_DESC_OPTION],
    groupBy: [GROUP_BY_CREATED_TIME_OPTION],
  },
  [ViewType.All]: {
    name: 'All',
    viewType: ViewType.All,
    filters: [],
    sortBy: [SORT_BY_CREATED_TIME_DESC_OPTION],
    groupBy: [GROUP_BY_CREATED_TIME_OPTION],
  },
  [ViewType.Today]: {
    name: 'Today',
    viewType: ViewType.Today,
    filters: [
      {
        field: 'createdTime',
        op: QueryFilterOp.GreaterThanOrEqual,
        value: new Date().toISOString(),
      },
    ],
    sortBy: [SORT_BY_CREATED_TIME_DESC_OPTION],
    groupBy: [GROUP_BY_CREATED_TIME_OPTION],
  },
};

export class Views {
  static get(viewType: ViewType): View<FeedItem> {
    switch (viewType) {
      case ViewType.Untriaged:
        return Views.getForInbox();
      case ViewType.Saved:
        return Views.getForSaved();
      case ViewType.Done:
        return Views.getForDone();
      case ViewType.Trashed:
        return Views.getForTrashed();
      case ViewType.Unread:
        return Views.getForUnread();
      case ViewType.Starred:
        return Views.getForStarred();
      case ViewType.All:
        return Views.getForAll();
      case ViewType.Today:
        return Views.getForToday();
      default:
        assertNever(viewType);
    }
  }

  static getForInbox(): View<FeedItem> {
    return ALL_VIEW_CONFIGS[ViewType.Untriaged];
  }

  static getForSaved(): View<FeedItem> {
    return ALL_VIEW_CONFIGS[ViewType.Saved];
  }

  static getForDone(): View<FeedItem> {
    return ALL_VIEW_CONFIGS[ViewType.Done];
  }

  static getForTrashed(): View<FeedItem> {
    return ALL_VIEW_CONFIGS[ViewType.Trashed];
  }

  static getForUnread(): View<FeedItem> {
    return ALL_VIEW_CONFIGS[ViewType.Unread];
  }

  static getForStarred(): View<FeedItem> {
    return ALL_VIEW_CONFIGS[ViewType.Starred];
  }

  static getForAll(): View<FeedItem> {
    return ALL_VIEW_CONFIGS[ViewType.All];
  }

  static getForToday(): View<FeedItem> {
    return ALL_VIEW_CONFIGS[ViewType.Today];
  }

  static getAllViewTypes(): ViewType[] {
    return Object.keys(ALL_VIEW_CONFIGS).map((key) => key as ViewType);
  }
}

export function getViewGroupByFieldText(viewGroupByField: ViewGroupByField): string {
  switch (viewGroupByField) {
    case ViewGroupByField.FeedItemContentType:
      return 'Type';
    case ViewGroupByField.FeedSourceType:
      return 'Source';
    case ViewGroupByField.ImportState:
      return 'Import state';
    case ViewGroupByField.CreatedTime:
      return 'Created date';
    case ViewGroupByField.LastUpdatedTime:
      return 'Last updated date';
    case ViewGroupByField.TriageStatus:
      return 'Triage status';
    default:
      assertNever(viewGroupByField);
  }
}

export function getViewSortByFieldText(viewSortByField: ViewSortByField): string {
  switch (viewSortByField) {
    case ViewSortByField.CreatedTime:
      return 'Created time';
    case ViewSortByField.LastUpdatedTime:
      return 'Last updated time';
    case ViewSortByField.Title:
      return 'Title';
    default:
      assertNever(viewSortByField);
  }
}
