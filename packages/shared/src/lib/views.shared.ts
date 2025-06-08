import {assertNever} from '@shared/lib/utils.shared';

import type {FeedItem} from '@shared/types/feedItems.types';
import {TriageStatus} from '@shared/types/feedItems.types';
import {QueryFilterOp} from '@shared/types/query.types';
import {SystemTagId} from '@shared/types/tags.types';
import {NavItemId} from '@shared/types/urls.types';
import type {ViewNavItemId} from '@shared/types/urls.types';
import type {
  View,
  ViewGroupByField,
  ViewGroupByOption,
  ViewSortByField,
} from '@shared/types/views.types';
import {
  SORT_BY_CREATED_TIME_DESC_OPTION,
  SORT_BY_LAST_UPDATED_TIME_DESC_OPTION,
  ViewType,
} from '@shared/types/views.types';

const GROUP_BY_CREATED_DATE_OPTION: ViewGroupByOption = {
  field: 'createdTime',
};

const GROUP_BY_LAST_UPDATED_DATE_OPTION: ViewGroupByOption = {
  field: 'lastUpdatedTime',
};

const ALL_VIEW_CONFIGS: Record<ViewType, View<FeedItem>> = {
  [ViewType.Untriaged]: {
    name: 'Untriaged',
    viewType: ViewType.Untriaged,
    filters: [{field: 'triageStatus', op: QueryFilterOp.Equals, value: TriageStatus.Untriaged}],
    sortBy: [SORT_BY_CREATED_TIME_DESC_OPTION],
    groupBy: [GROUP_BY_CREATED_DATE_OPTION],
  },
  [ViewType.Saved]: {
    name: 'Saved',
    viewType: ViewType.Saved,
    filters: [{field: 'triageStatus', op: QueryFilterOp.Equals, value: TriageStatus.Saved}],
    sortBy: [SORT_BY_LAST_UPDATED_TIME_DESC_OPTION],
    groupBy: [GROUP_BY_LAST_UPDATED_DATE_OPTION],
  },
  [ViewType.Done]: {
    name: 'Done',
    viewType: ViewType.Done,
    filters: [{field: 'triageStatus', op: QueryFilterOp.Equals, value: TriageStatus.Done}],
    sortBy: [SORT_BY_LAST_UPDATED_TIME_DESC_OPTION],
    groupBy: [GROUP_BY_LAST_UPDATED_DATE_OPTION],
  },
  [ViewType.Trashed]: {
    name: 'Trashed',
    viewType: ViewType.Trashed,
    filters: [{field: 'triageStatus', op: QueryFilterOp.Equals, value: TriageStatus.Trashed}],
    sortBy: [SORT_BY_LAST_UPDATED_TIME_DESC_OPTION],
    groupBy: [GROUP_BY_LAST_UPDATED_DATE_OPTION],
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
    groupBy: [GROUP_BY_CREATED_DATE_OPTION],
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
    groupBy: [GROUP_BY_CREATED_DATE_OPTION],
  },
  [ViewType.All]: {
    name: 'All',
    viewType: ViewType.All,
    filters: [],
    sortBy: [SORT_BY_CREATED_TIME_DESC_OPTION],
    groupBy: [GROUP_BY_CREATED_DATE_OPTION],
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
    groupBy: [GROUP_BY_CREATED_DATE_OPTION],
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

  static fromNavItemId(navItemId: ViewNavItemId): ViewType {
    switch (navItemId) {
      case NavItemId.Untriaged:
        return ViewType.Untriaged;
      case NavItemId.Saved:
        return ViewType.Saved;
      case NavItemId.Done:
        return ViewType.Done;
      case NavItemId.Unread:
        return ViewType.Unread;
      case NavItemId.Starred:
        return ViewType.Starred;
      case NavItemId.All:
        return ViewType.All;
      case NavItemId.Today:
        return ViewType.Today;
      case NavItemId.Trashed:
        return ViewType.Trashed;
      default:
        assertNever(navItemId);
    }
  }
}

export function toViewGroupByOptionText(viewGroupByField: ViewGroupByField): string {
  switch (viewGroupByField) {
    case 'feedItemContentType':
      return 'Type';
    case 'feedSourceType':
      return 'Source';
    case 'importState':
      return 'Import state';
    case 'createdTime':
      return 'Created date';
    case 'lastUpdatedTime':
      return 'Last updated date';
    default:
      assertNever(viewGroupByField);
  }
}

export function toViewSortByOptionText(viewSortByField: ViewSortByField): string {
  switch (viewSortByField) {
    case 'createdTime':
      return 'Created time';
    case 'lastUpdatedTime':
      return 'Last updated time';
    case 'title':
      return 'Title';
    default:
      assertNever(viewSortByField);
  }
}
