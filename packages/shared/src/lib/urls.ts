import {FeedItemId} from '@shared/types/core';
import {ViewType} from '@shared/types/query';
import {NavItem} from '@shared/types/urls';

import {CustomIconType} from './customIcon';
import {assertNever} from './utils';

const ALL_NAV_ITEMS: Record<string, NavItem> = {
  [ViewType.Untriaged]: {
    icon: {
      type: CustomIconType.Emoji,
      emoji: '🏠',
    },
    title: 'Home',
    viewType: ViewType.Untriaged,
  },
  [ViewType.Saved]: {
    icon: {
      type: CustomIconType.Emoji,
      emoji: '💾',
    },
    title: 'Saved',
    viewType: ViewType.Saved,
  },
  [ViewType.Done]: {
    icon: {
      type: CustomIconType.Emoji,
      emoji: '✅',
    },
    title: 'Done',
    viewType: ViewType.Done,
  },
  [ViewType.Unread]: {
    icon: {
      type: CustomIconType.Emoji,
      emoji: '📰',
    },
    title: 'Unread',
    viewType: ViewType.Unread,
  },
  [ViewType.Starred]: {
    icon: {
      type: CustomIconType.Emoji,
      emoji: '⭐️',
    },
    title: 'Starred',
    viewType: ViewType.Starred,
  },
  [ViewType.All]: {
    icon: {
      type: CustomIconType.Emoji,
      emoji: '📚',
    },
    title: 'All',
    viewType: ViewType.All,
  },
  [ViewType.Trashed]: {
    icon: {
      type: CustomIconType.Emoji,
      emoji: '🗑️',
    },
    title: 'Trashed',
    viewType: ViewType.Trashed,
  },
  [ViewType.Today]: {
    icon: {
      type: CustomIconType.Emoji,
      emoji: '📅',
    },
    title: 'Today',
    viewType: ViewType.Today,
  },
};

const ALL_ORDERED_NAV_ITEMS: NavItem[] = [
  ALL_NAV_ITEMS[ViewType.Untriaged],
  ALL_NAV_ITEMS[ViewType.Saved],
  ALL_NAV_ITEMS[ViewType.Done],
  ALL_NAV_ITEMS[ViewType.Unread],
  ALL_NAV_ITEMS[ViewType.Starred],
  ALL_NAV_ITEMS[ViewType.All],
  ALL_NAV_ITEMS[ViewType.Trashed],
  ALL_NAV_ITEMS[ViewType.Today],
];

export class Urls {
  static forRoot() {
    return '/';
  }

  static forView(viewType: ViewType) {
    switch (viewType) {
      case ViewType.Untriaged:
        return Urls.forRoot();
      case ViewType.Saved:
        return '/saved';
      case ViewType.Done:
        return '/done';
      case ViewType.Trashed:
        return '/trashed';
      case ViewType.Unread:
        return '/unread';
      case ViewType.Starred:
        return '/starred';
      case ViewType.All:
        return '/all';
      case ViewType.Today:
        return '/today';
      default:
        assertNever(viewType);
    }
  }

  static forFeedItem(feedItemId: FeedItemId) {
    return `/items/${feedItemId}`;
  }

  static getOrderedNavItems(): NavItem[] {
    return ALL_ORDERED_NAV_ITEMS;
  }
}
