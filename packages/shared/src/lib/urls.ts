import {FeedItemId} from '@shared/types/core';
import {ViewType} from '@shared/types/query';
import {NavItem} from '@shared/types/urls';

import {CustomIconType} from './customIcon';
import {assertNever} from './utils';

const ALL_ORDERED_NAV_ITEMS: NavItem[] = [
  {
    icon: {
      type: CustomIconType.Emoji,
      emoji: '🏠',
    },
    title: 'Home',
    viewType: ViewType.Untriaged,
  },
  {
    icon: {
      type: CustomIconType.Emoji,
      emoji: '💾',
    },
    title: 'Saved',
    viewType: ViewType.Saved,
  },
  {
    icon: {
      type: CustomIconType.Emoji,
      emoji: '✅',
    },
    title: 'Done',
    viewType: ViewType.Done,
  },
  {
    icon: {
      type: CustomIconType.Emoji,
      emoji: '📰',
    },
    title: 'Unread',
    viewType: ViewType.Unread,
  },
  {
    icon: {
      type: CustomIconType.Emoji,
      emoji: '⭐️',
    },
    title: 'Starred',
    viewType: ViewType.Starred,
  },
  {
    icon: {
      type: CustomIconType.Emoji,
      emoji: '📚',
    },
    title: 'All',
    viewType: ViewType.All,
  },
];

export class Urls {
  static forRoot() {
    return '/';
  }

  static forView(viewType: ViewType) {
    switch (viewType) {
      case ViewType.Untriaged:
        return '/';
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
