import {makeEmojiIcon} from '@shared/lib/customIcons.shared';
import {syncTry} from '@shared/lib/errorUtils.shared';
import {assertNever} from '@shared/lib/utils.shared';

import type {FeedItemId} from '@shared/types/feedItems.types';
import {ViewType} from '@shared/types/query.types';
import {makeNavItemForView, type NavItem} from '@shared/types/urls.types';

// TODO: Make URL validation more robust.
export function isValidUrl(url: string): boolean {
  const isValidUrlResult1 = syncTry(() => new URL(url));
  if (isValidUrlResult1.success) return true;

  const isValidUrlResult2 = syncTry(() => new URL('https://' + url));
  return isValidUrlResult2.success;
}

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

  static forFeedItemRoot(): string {
    return '/items';
  }

  static forFeedItem(feedItemId: FeedItemId): string {
    return `${this.forFeedItemRoot()}/${feedItemId}`;
  }

  static forFeedItemUnsafe(maybeFeedItemId: string): string {
    return `${this.forFeedItemRoot()}/${maybeFeedItemId}`;
  }

  static forFeedSubscriptions(): string {
    return '/feeds';
  }

  static getOrderedViewNavItems(): NavItem[] {
    // Return a copy to prevent external modification.
    return [...ALL_ORDERED_VIEW_NAV_ITEMS];
  }

  static getAllNavItems(): NavItem[] {
    // Return a copy to prevent external modification.
    return [...this.getOrderedViewNavItems(), this.getFeedsNavItem()];
  }

  static getViewNavItem(viewType: ViewType): NavItem {
    return ALL_NAV_ITEMS[viewType];
  }

  static getFeedsNavItem(): NavItem {
    return ALL_NAV_ITEMS.ALL_FEEDS;
  }

  static forSignIn(): string {
    return '/login';
  }

  static forSignOut(): string {
    return '/logout';
  }

  static forStyleguide(): string {
    return '/styleguide';
  }
}

const ALL_NAV_ITEMS: Record<ViewType | 'ALL_FEEDS', NavItem> = {
  [ViewType.Untriaged]: makeNavItemForView(ViewType.Untriaged, {
    icon: makeEmojiIcon('🆕'),
    title: 'New',
  }),
  [ViewType.Saved]: makeNavItemForView(ViewType.Saved, {
    icon: makeEmojiIcon('💾'),
    title: 'Saved',
  }),
  [ViewType.Done]: makeNavItemForView(ViewType.Done, {
    icon: makeEmojiIcon('✅'),
    title: 'Done',
  }),
  [ViewType.Unread]: makeNavItemForView(ViewType.Unread, {
    icon: makeEmojiIcon('👀'),
    title: 'Unread',
  }),
  [ViewType.Starred]: makeNavItemForView(ViewType.Starred, {
    icon: makeEmojiIcon('⭐️'),
    title: 'Starred',
  }),
  [ViewType.All]: makeNavItemForView(ViewType.All, {
    icon: makeEmojiIcon('📚'),
    title: 'All',
  }),
  [ViewType.Trashed]: makeNavItemForView(ViewType.Trashed, {
    icon: makeEmojiIcon('🗑️'),
    title: 'Trashed',
  }),
  [ViewType.Today]: makeNavItemForView(ViewType.Today, {
    icon: makeEmojiIcon('📅'),
    title: 'Today',
  }),
  ALL_FEEDS: {
    url: Urls.forFeedSubscriptions(),
    icon: makeEmojiIcon('📰'),
    title: 'Feeds',
  },
};

const ALL_ORDERED_VIEW_NAV_ITEMS: NavItem[] = [
  ALL_NAV_ITEMS[ViewType.Untriaged],
  ALL_NAV_ITEMS[ViewType.Saved],
  ALL_NAV_ITEMS[ViewType.Done],
  ALL_NAV_ITEMS[ViewType.Unread],
  ALL_NAV_ITEMS[ViewType.Starred],
  ALL_NAV_ITEMS[ViewType.All],
  ALL_NAV_ITEMS[ViewType.Trashed],
  ALL_NAV_ITEMS[ViewType.Today],
];
