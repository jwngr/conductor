import {assertNever} from '@shared/lib/utils.shared';

import type {FeedItem} from '@shared/types/feedItems.types';
import {TriageStatus} from '@shared/types/feedItems.types';
import type {View} from '@shared/types/query.types';
import {FilterOp, ViewType} from '@shared/types/query.types';
import {SystemTagId} from '@shared/types/tags.types';
import {NavItemId} from '@shared/types/urls.types';

const ALL_VIEW_CONFIGS: Record<ViewType, View<FeedItem>> = {
  [ViewType.Untriaged]: {
    name: 'Untriaged',
    type: ViewType.Untriaged,
    filters: [{field: 'triageStatus', op: FilterOp.Equals, value: TriageStatus.Untriaged}],
    sort: {field: 'createdTime', direction: 'desc'},
  },
  [ViewType.Saved]: {
    name: 'Saved',
    type: ViewType.Saved,
    filters: [{field: 'triageStatus', op: FilterOp.Equals, value: TriageStatus.Saved}],
    sort: {field: 'lastUpdatedTime', direction: 'desc'},
  },
  [ViewType.Done]: {
    name: 'Done',
    type: ViewType.Done,
    filters: [{field: 'triageStatus', op: FilterOp.Equals, value: TriageStatus.Done}],
    sort: {field: 'lastUpdatedTime', direction: 'desc'},
  },
  [ViewType.Trashed]: {
    name: 'Trashed',
    type: ViewType.Trashed,
    filters: [{field: 'triageStatus', op: FilterOp.Equals, value: TriageStatus.Trashed}],
    sort: {field: 'lastUpdatedTime', direction: 'desc'},
  },
  [ViewType.Unread]: {
    name: 'Unread',
    type: ViewType.Unread,
    filters: [
      // TODO: Fix the typecasting here.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      {field: `tagIds.${SystemTagId.Unread}` as any, op: FilterOp.Equals, value: true},
    ],
    sort: {field: 'createdTime', direction: 'desc'},
  },
  [ViewType.Starred]: {
    name: 'Starred',
    type: ViewType.Starred,
    filters: [
      // TODO: Fix the typecasting here.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      {field: `tagIds.${SystemTagId.Starred}` as any, op: FilterOp.Equals, value: true},
    ],
    sort: {field: 'createdTime', direction: 'desc'},
  },
  [ViewType.All]: {
    name: 'All',
    type: ViewType.All,
    filters: [],
    sort: {field: 'createdTime', direction: 'desc'},
  },
  [ViewType.Today]: {
    name: 'Today',
    type: ViewType.Today,
    filters: [
      {
        field: 'createdTime',
        op: FilterOp.GreaterThanOrEqual,
        value: new Date().toISOString(),
      },
    ],
    sort: {field: 'createdTime', direction: 'desc'},
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

  static fromNavItemId(
    navItemId: Exclude<NavItemId, NavItemId.Feeds | NavItemId.Import>
  ): ViewType {
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
