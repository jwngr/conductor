import {makeEmojiIcon} from '@shared/lib/customIcons.shared';
import {assertNever} from '@shared/lib/utils.shared';

import type {NavItem} from '@shared/types/urls.types';
import {NavItemId} from '@shared/types/urls.types';
import {ViewType} from '@shared/types/views.types';

const ALL_NAV_ITEMS: Record<NavItemId, NavItem> = {
  [NavItemId.Untriaged]: {
    id: NavItemId.Untriaged,
    icon: makeEmojiIcon('🆕'),
    title: 'New',
  },
  [NavItemId.Saved]: {
    id: NavItemId.Saved,
    icon: makeEmojiIcon('💾'),
    title: 'Saved',
  },
  [NavItemId.Done]: {
    id: NavItemId.Done,
    icon: makeEmojiIcon('✅'),
    title: 'Done',
  },
  [NavItemId.Unread]: {
    id: NavItemId.Unread,
    icon: makeEmojiIcon('👀'),
    title: 'Unread',
  },
  [NavItemId.Starred]: {
    id: NavItemId.Starred,
    icon: makeEmojiIcon('⭐️'),
    title: 'Starred',
  },
  [NavItemId.All]: {
    id: NavItemId.All,
    icon: makeEmojiIcon('📚'),
    title: 'All',
  },
  [NavItemId.Trashed]: {
    id: NavItemId.Trashed,
    icon: makeEmojiIcon('🗑️'),
    title: 'Trashed',
  },
  [NavItemId.Today]: {
    id: NavItemId.Today,
    icon: makeEmojiIcon('📅'),
    title: 'Today',
  },
  [NavItemId.Feeds]: {
    id: NavItemId.Feeds,
    icon: makeEmojiIcon('📰'),
    title: 'Feeds',
  },
  [NavItemId.Import]: {
    id: NavItemId.Import,
    icon: makeEmojiIcon('📥'),
    title: 'Import',
  },
  [NavItemId.Experiments]: {
    id: NavItemId.Experiments,
    icon: makeEmojiIcon('🧪'),
    title: 'Experiments',
  },
};

export class NavItems {
  static fromId(navItemId: NavItemId): NavItem {
    return ALL_NAV_ITEMS[navItemId];
  }
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

export const ORDERED_SOURCE_NAV_ITEMS: NavItem[] = [
  NavItems.fromId(NavItemId.Feeds),
  NavItems.fromId(NavItemId.Import),
  NavItems.fromId(NavItemId.Experiments),
];

export function getNavItemIdFromViewType(viewType: ViewType): NavItemId {
  switch (viewType) {
    case ViewType.Untriaged:
      return NavItemId.Untriaged;
    case ViewType.Saved:
      return NavItemId.Saved;
    case ViewType.Done:
      return NavItemId.Done;
    case ViewType.Unread:
      return NavItemId.Unread;
    case ViewType.Starred:
      return NavItemId.Starred;
    case ViewType.All:
      return NavItemId.All;
    case ViewType.Today:
      return NavItemId.Today;
    case ViewType.Trashed:
      return NavItemId.Trashed;
    default:
      assertNever(viewType);
  }
}
