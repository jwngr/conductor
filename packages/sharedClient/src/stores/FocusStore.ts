import {create, type StateCreator} from 'zustand';

import type {FeedItemId} from '@shared/types/feedItems.types';
import type {ViewType} from '@shared/types/query.types';
import type {Func} from '@shared/types/utils.types';

/**
 * The `FocusStore` tracks the priority of elements that have focus across the app. It is used to
 * drive product functionality like which sidebar item is active and which list item has focus.
 */
interface FocusState {
  /**
   * The feed item that has focus. Can be null, e.g. nothing has focus initially.
   */
  readonly focusedFeedItemId: FeedItemId | null;

  /**
   * The view that has focus, from which a feed item is being shown. Can be null, e.g. when viewing
   * a feed item via a direct URL.
   */
  readonly focusedViewType: ViewType | null;

  // Actions.
  readonly setFocusedFeedItemId: Func<FeedItemId | null, void>;
  readonly setFocusedViewType: Func<ViewType | null, void>;
}

const createFocusStore: StateCreator<FocusState> = (set) => ({
  // Initial state.
  focusedFeedItemId: null,
  focusedViewType: null,

  // Actions.
  setFocusedFeedItemId: (feedItemId) => set({focusedFeedItemId: feedItemId}),
  setFocusedViewType: (viewType) => {
    return set({
      focusedViewType: viewType,
      // Focusing a new view resets list item focus.
      focusedFeedItemId: null,
    });
  },
});

export const useFocusStore = create<FocusState>(createFocusStore);
