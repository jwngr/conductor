import {create, type StateCreator} from 'zustand';

import type {FeedItemId} from '@shared/types/ids.types';
import type {Func} from '@shared/types/utils.types';

/**
 * The `FocusStore` tracks the priority of elements that have focus across the app. It is used to
 * drive product functionality like which sidebar item is active and which list item has focus.
 */
interface FocusState {
  /** The feed item that has focus. Can be null, e.g. nothing has focus initially. */
  readonly focusedFeedItemId: FeedItemId | null;

  // Actions.
  readonly setFocusedFeedItemId: Func<FeedItemId | null, void>;
}

const createFocusStore: StateCreator<FocusState> = (set) => ({
  // Initial state.
  focusedFeedItemId: null,

  // Actions.
  setFocusedFeedItemId: (feedItemId) => set({focusedFeedItemId: feedItemId}),
});

export const useFocusStore = create<FocusState>(createFocusStore);
