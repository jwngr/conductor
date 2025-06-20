import {useNavigate} from '@tanstack/react-router';
import {useCallback, useMemo} from 'react';
import type React from 'react';

import type {FeedItem} from '@shared/types/feedItems.types';

import {useFocusStore} from '@sharedClient/stores/FocusStore';

import {keyboardShortcutsService, useShortcuts} from '@src/lib/shortcuts.pwa';

import {feedItemRoute} from '@src/routes';

export const ViewKeyboardShortcutHandler: React.FC<{
  readonly feedItems: readonly FeedItem[];
}> = ({feedItems}) => {
  const navigate = useNavigate();
  const {focusedFeedItemId, setFocusedFeedItemId} = useFocusStore();

  const focusedIndex = useMemo(
    () =>
      focusedFeedItemId ? feedItems.findIndex((item) => item.feedItemId === focusedFeedItemId) : -1,
    [feedItems, focusedFeedItemId]
  );

  const handleArrowDown = useCallback(async () => {
    if (!feedItems.length) return;

    if (focusedIndex === -1 || focusedIndex === feedItems.length - 1) {
      setFocusedFeedItemId(feedItems[0].feedItemId);
    } else {
      setFocusedFeedItemId(feedItems[focusedIndex + 1].feedItemId);
    }
  }, [feedItems, focusedIndex, setFocusedFeedItemId]);

  const handleArrowUp = useCallback(async () => {
    if (!feedItems.length) return;

    if (focusedIndex === -1 || focusedIndex === 0) {
      setFocusedFeedItemId(feedItems[feedItems.length - 1].feedItemId);
    } else {
      setFocusedFeedItemId(feedItems[focusedIndex - 1].feedItemId);
    }
  }, [feedItems, focusedIndex, setFocusedFeedItemId]);

  const handleEnter = useCallback(async () => {
    if (!feedItems.length) return;
    if (!focusedFeedItemId) return;

    await navigate({to: feedItemRoute.to, params: {feedItemId: focusedFeedItemId}});
  }, [feedItems, focusedFeedItemId, navigate]);

  useShortcuts([
    {shortcut: keyboardShortcutsService.forArrowDown(), handler: handleArrowDown},
    {shortcut: keyboardShortcutsService.forArrowUp(), handler: handleArrowUp},
    {shortcut: keyboardShortcutsService.forEnter(), handler: handleEnter},
  ]);

  return null;
};
