import {useCallback, useMemo} from 'react';
import type React from 'react';
import {useNavigate} from 'react-router-dom';

import {Urls} from '@shared/lib/urls.shared';

import type {FeedItem} from '@shared/types/feedItems.types';

import {useFocusStore} from '@sharedClient/stores/FocusStore';

import {keyboardShortcutsService, useShortcuts} from '@src/lib/shortcuts.pwa';

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

  const handleArrowDown = useCallback(() => {
    if (!feedItems.length) return;

    if (focusedIndex === -1 || focusedIndex === feedItems.length - 1) {
      setFocusedFeedItemId(feedItems[0].feedItemId);
    } else {
      setFocusedFeedItemId(feedItems[focusedIndex + 1].feedItemId);
    }
  }, [feedItems, focusedIndex, setFocusedFeedItemId]);

  const handleArrowUp = useCallback(() => {
    if (!feedItems.length) return;

    if (focusedIndex === -1 || focusedIndex === 0) {
      setFocusedFeedItemId(feedItems[feedItems.length - 1].feedItemId);
    } else {
      setFocusedFeedItemId(feedItems[focusedIndex - 1].feedItemId);
    }
  }, [feedItems, focusedIndex, setFocusedFeedItemId]);

  const handleEnter = useCallback(() => {
    if (!feedItems.length) return;

    if (focusedFeedItemId) {
      navigate(Urls.forFeedItem(focusedFeedItemId));
    }
  }, [feedItems, focusedFeedItemId, navigate]);

  useShortcuts([
    {shortcut: keyboardShortcutsService.forArrowDown(), handler: handleArrowDown},
    {shortcut: keyboardShortcutsService.forArrowUp(), handler: handleArrowUp},
    {shortcut: keyboardShortcutsService.forEnter(), handler: handleEnter},
  ]);

  return null;
};
