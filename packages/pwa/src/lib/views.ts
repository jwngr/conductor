import {assertNever} from '@shared/lib/utils';
import {FilterOp, View, ViewType} from '@shared/types/query';

const ALL_VIEW_CONFIGS: Record<ViewType, View> = {
  [ViewType.Inbox]: {
    name: 'Inbox',
    type: ViewType.Inbox,
    filters: [
      {field: 'isDone', op: FilterOp.Equals, value: false},
      // {field: 'isRead', op: FilterOperator.Equals, value: false},
    ],
    sort: {field: 'createdTime', direction: 'desc'},
  },
  [ViewType.Done]: {
    name: 'Done',
    type: ViewType.Done,
    filters: [{field: 'isDone', op: FilterOp.Equals, value: true}],
    sort: {field: 'lastUpdatedTime', direction: 'desc'},
  },
  [ViewType.Unread]: {
    name: 'Unread',
    type: ViewType.Unread,
    filters: [{field: 'isRead', op: FilterOp.Equals, value: false}],
    sort: {field: 'createdTime', direction: 'desc'},
  },
  [ViewType.Saved]: {
    name: 'Saved',
    type: ViewType.Saved,
    filters: [{field: 'isSaved', op: FilterOp.Equals, value: true}],
    sort: {field: 'lastUpdatedTime', direction: 'desc'},
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
        value: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
      },
    ],
    sort: {field: 'createdTime', direction: 'desc'},
  },
};

export class Views {
  static get(viewType: ViewType): View {
    switch (viewType) {
      case ViewType.Inbox:
        return Views.getForInbox();
      case ViewType.Done:
        return Views.getForDone();
      case ViewType.Unread:
        return Views.getForUnread();
      case ViewType.Saved:
        return Views.getForSaved();
      case ViewType.All:
        return Views.getForAll();
      case ViewType.Today:
        return Views.getForToday();
      default:
        assertNever(viewType);
    }
  }

  static getForInbox(): View {
    return ALL_VIEW_CONFIGS[ViewType.Inbox];
  }

  static getForDone(): View {
    return ALL_VIEW_CONFIGS[ViewType.Done];
  }

  static getForUnread(): View {
    return ALL_VIEW_CONFIGS[ViewType.Unread];
  }

  static getForSaved(): View {
    return ALL_VIEW_CONFIGS[ViewType.Saved];
  }

  static getForAll(): View {
    return ALL_VIEW_CONFIGS[ViewType.All];
  }

  static getForToday(): View {
    return ALL_VIEW_CONFIGS[ViewType.Today];
  }
}
