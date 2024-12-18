import {CustomIconType} from '@shared/lib/customIcons';
import {syncTry} from '@shared/lib/errors';
import {assertNever} from '@shared/lib/utils';

import {FeedItemId} from '@shared/types/feedItems.types';
import {ViewType} from '@shared/types/query.types';
import {NavItem} from '@shared/types/urls.types';

// TODO: Make URL validation more robust.
export function isValidUrl(url: string): boolean {
  const isValidUrlResult1 = syncTry(() => new URL(url));
  if (isValidUrlResult1.success) return true;

  const isValidUrlResult2 = syncTry(() => new URL('https://' + url));
  return isValidUrlResult2.success;
}

const ALL_NAV_ITEMS: Record<ViewType, NavItem> = {
  [ViewType.Untriaged]: {
    icon: {
      type: CustomIconType.Emoji,
      emoji: '🆕',
    },
    title: 'New',
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
  static forRoot(): string {
    return '/';
  }

  static forView(viewType: ViewType): string {
    switch (viewType) {
      case ViewType.Untriaged:
        return this.forRoot();
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

  static forFeeds(): string {
    return '/feeds';
  }

  static forFeedItemRoot(): string {
    return '/items';
  }

  static forFeedItem(feedItemId: FeedItemId): string {
    return `${this.forFeedItemRoot()}/${feedItemId}`;
  }

  static forFeedItemUnsafe(maybeFeedItemId: string): string {
    return `${this.forFeedItemRoot()}/${maybeFeedItemId}`;
  }

  static getOrderedNavItems(): NavItem[] {
    // Return a copy to prevent external modification.
    return [...ALL_ORDERED_NAV_ITEMS];
  }

  static getNavItem(viewType: ViewType): NavItem {
    return ALL_NAV_ITEMS[viewType];
  }

  static forSignIn(): string {
    return '/login';
  }

  static forSignOut(): string {
    return '/logout';
  }
}
