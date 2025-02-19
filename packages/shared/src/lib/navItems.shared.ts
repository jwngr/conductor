import {makeEmojiIcon} from '@shared/lib/customIcons.shared';
import {Urls} from '@shared/lib/urls.shared';
import {assertNever} from '@shared/lib/utils.shared';

import {ViewType} from '@shared/types/query.types';
import type {NavItem} from '@shared/types/urls.types';
import {NavItemId} from '@shared/types/urls.types';

const ALL_NAV_ITEMS: Record<NavItemId, NavItem> = {
  [NavItemId.Untriaged]: makeNavItemForView(NavItemId.Untriaged, ViewType.Untriaged, {
    icon: makeEmojiIcon('🆕'),
    title: 'New',
  }),
  [NavItemId.Saved]: makeNavItemForView(NavItemId.Saved, ViewType.Saved, {
    icon: makeEmojiIcon('💾'),
    title: 'Saved',
  }),
  [NavItemId.Done]: makeNavItemForView(NavItemId.Done, ViewType.Done, {
    icon: makeEmojiIcon('✅'),
    title: 'Done',
  }),
  [NavItemId.Unread]: makeNavItemForView(NavItemId.Unread, ViewType.Unread, {
    icon: makeEmojiIcon('👀'),
    title: 'Unread',
  }),
  [NavItemId.Starred]: makeNavItemForView(NavItemId.Starred, ViewType.Starred, {
    icon: makeEmojiIcon('⭐️'),
    title: 'Starred',
  }),
  [NavItemId.All]: makeNavItemForView(NavItemId.All, ViewType.All, {
    icon: makeEmojiIcon('📚'),
    title: 'All',
  }),
  [NavItemId.Trashed]: makeNavItemForView(NavItemId.Trashed, ViewType.Trashed, {
    icon: makeEmojiIcon('🗑️'),
    title: 'Trashed',
  }),
  [NavItemId.Today]: makeNavItemForView(NavItemId.Today, ViewType.Today, {
    icon: makeEmojiIcon('📅'),
    title: 'Today',
  }),
  [NavItemId.Feeds]: {
    id: NavItemId.Feeds,
    url: Urls.forFeedSubscriptions(),
    icon: makeEmojiIcon('📰'),
    title: 'Feeds',
  },
};

export class NavItems {
  static fromId(navItemId: NavItemId): NavItem {
    return ALL_NAV_ITEMS[navItemId];
  }

  static fromViewType(viewType: ViewType): NavItem {
    switch (viewType) {
      case ViewType.Untriaged:
        return NavItems.fromId(NavItemId.Untriaged);
      case ViewType.Saved:
        return NavItems.fromId(NavItemId.Saved);
      case ViewType.Done:
        return NavItems.fromId(NavItemId.Done);
      case ViewType.Unread:
        return NavItems.fromId(NavItemId.Unread);
      case ViewType.Starred:
        return NavItems.fromId(NavItemId.Starred);
      case ViewType.All:
        return NavItems.fromId(NavItemId.All);
      case ViewType.Today:
        return NavItems.fromId(NavItemId.Today);
      case ViewType.Trashed:
        return NavItems.fromId(NavItemId.Trashed);
      default:
        assertNever(viewType);
    }
  }
}

export const DEFAULT_FOCUSED_NAV_ITEM: NavItemId = NavItemId.Untriaged;

export function makeNavItemForView(
  navItemId: NavItemId,
  viewType: ViewType,
  args: Omit<NavItem, 'id' | 'url'>
): NavItem {
  return {
    id: navItemId,
    url: Urls.forView(viewType),
    icon: args.icon,
    title: args.title,
  };
}

export const ORDERED_VIEW_NAV_ITEMS: NavItem[] = [
  NavItems.fromId(NavItemId.Untriaged),
  NavItems.fromId(NavItemId.Saved),
  NavItems.fromId(NavItemId.Done),
  NavItems.fromId(NavItemId.Unread),
  NavItems.fromId(NavItemId.Starred),
  NavItems.fromId(NavItemId.All),
  NavItems.fromId(NavItemId.Trashed),
  NavItems.fromId(NavItemId.Today),
];
