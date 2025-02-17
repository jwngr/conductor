import type {Params} from 'react-router-dom';

import {makeEmojiIcon, type CustomIcon} from '@shared/lib/customIcons.shared';
import {Urls} from '@shared/lib/urls.shared';
import {assertNever} from '@shared/lib/utils.shared';

import type {FeedItemId} from '@shared/types/feedItems.types';
import {ViewType} from '@shared/types/query.types';

export interface FeedItemScreenParams extends Params {
  readonly feedItemId: FeedItemId;
}

export enum NavItemId {
  Untriaged = 'UNTRIAGED',
  Saved = 'SAVED',
  Done = 'DONE',
  Unread = 'UNREAD',
  Starred = 'STARRED',
  All = 'ALL',
  Today = 'TODAY',
  Trashed = 'TRASHED',
  Feeds = 'FEEDS',
}

export interface NavItem {
  readonly id: NavItemId;
  readonly url: string;
  readonly icon: CustomIcon;
  readonly title: string;
}

export function makeNavItemForView(viewType: ViewType, args: Omit<NavItem, 'id' | 'url'>): NavItem {
  return {
    id: NavItems.forView(viewType).id,
    url: Urls.forView(viewType),
    icon: args.icon,
    title: args.title,
  };
}

const ALL_NAV_ITEMS: Record<NavItemId, NavItem> = {
  [NavItemId.Untriaged]: makeNavItemForView(ViewType.Untriaged, {
    icon: makeEmojiIcon('🆕'),
    title: 'New',
  }),
  [NavItemId.Saved]: makeNavItemForView(ViewType.Saved, {
    icon: makeEmojiIcon('💾'),
    title: 'Saved',
  }),
  [NavItemId.Done]: makeNavItemForView(ViewType.Done, {
    icon: makeEmojiIcon('✅'),
    title: 'Done',
  }),
  [NavItemId.Unread]: makeNavItemForView(ViewType.Unread, {
    icon: makeEmojiIcon('👀'),
    title: 'Unread',
  }),
  [NavItemId.Starred]: makeNavItemForView(ViewType.Starred, {
    icon: makeEmojiIcon('⭐️'),
    title: 'Starred',
  }),
  [NavItemId.All]: makeNavItemForView(ViewType.All, {
    icon: makeEmojiIcon('📚'),
    title: 'All',
  }),
  [NavItemId.Trashed]: makeNavItemForView(ViewType.Trashed, {
    icon: makeEmojiIcon('🗑️'),
    title: 'Trashed',
  }),
  [NavItemId.Today]: makeNavItemForView(ViewType.Today, {
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
}

export const DEFAULT_FOCUSED_NAV_ITEM: NavItemId = NavItemId.Untriaged;
