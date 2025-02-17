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
  static forId(navItemId: NavItemId): NavItem {
    return ALL_NAV_ITEMS[navItemId];
  }

  static forView(viewType: ViewType): NavItem {
    switch (viewType) {
      case ViewType.Untriaged:
        return NavItems.forId(NavItemId.Untriaged);
      case ViewType.Saved:
        return NavItems.forId(NavItemId.Saved);
      case ViewType.Done:
        return NavItems.forId(NavItemId.Done);
      case ViewType.Unread:
        return NavItems.forId(NavItemId.Unread);
      case ViewType.Starred:
        return NavItems.forId(NavItemId.Starred);
      case ViewType.All:
        return NavItems.forId(NavItemId.All);
      case ViewType.Today:
        return NavItems.forId(NavItemId.Today);
      case ViewType.Trashed:
        return NavItems.forId(NavItemId.Trashed);
      default:
        assertNever(viewType);
    }
  }

  static toViewType(navItemId: Exclude<NavItemId, NavItemId.Feeds>): ViewType {
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
