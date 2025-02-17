import {create, type StateCreator} from 'zustand';

import {DEFAULT_FOCUSED_NAV_ITEM} from '@shared/lib/navItems.shared';

import type {FeedItemId} from '@shared/types/feedItems.types';
import type {NavItemId} from '@shared/types/urls.types';
import type {Func} from '@shared/types/utils.types';

/**
 * The `FocusStore` tracks the priority of elements that have focus across the app. It is used to
 * drive product functionality like which sidebar item is active and which list item has focus.
 */
interface FocusState {
  /** The nav item that has focus. */
  readonly focusedNavItemId: NavItemId;

  /** The feed item that has focus. Can be null, e.g. nothing has focus initially. */
  readonly focusedFeedItemId: FeedItemId | null;

  // Actions.
  readonly setFocusedFeedItemId: Func<FeedItemId | null, void>;
  readonly setFocusedNavItemId: Func<NavItemId, void>;
}

const createFocusStore: StateCreator<FocusState> = (set) => ({
  // Initial state.
  focusedNavItemId: DEFAULT_FOCUSED_NAV_ITEM,
  focusedFeedItemId: null,

  // Actions.
  setFocusedFeedItemId: (feedItemId) => set({focusedFeedItemId: feedItemId}),
  setFocusedNavItemId: (navItemId) => {
    return set({
      focusedNavItemId: navItemId,
      // Focusing a new view resets list item focus.
      focusedFeedItemId: null,
    });
  },
});

export const useFocusStore = create<FocusState>(createFocusStore);
