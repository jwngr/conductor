import {useNavigate} from '@tanstack/react-router';
import {useCallback, useEffect} from 'react';

import {SharedKeyboardShortcutsService} from '@shared/services/keyboardShortcuts.shared';

import {assertNever} from '@shared/lib/utils.shared';

import type {KeyboardShortcut, ShortcutHandler} from '@shared/types/shortcuts.types';
import {NavItemId} from '@shared/types/urls.types';

import {IS_MAC} from '@sharedClient/lib/environment.client';

import {
  allViewRoute,
  doneViewRoute,
  experimentsRoute,
  feedSubscriptionsRoute,
  importRoute,
  savedViewRoute,
  starredViewRoute,
  todayViewRoute,
  trashedViewRoute,
  unreadViewRoute,
  untriagedViewRoute,
} from '@src/routes';

interface ShortcutWithHandler {
  readonly shortcut: KeyboardShortcut;
  readonly handler: ShortcutHandler;
}

export const keyboardShortcutsService = new SharedKeyboardShortcutsService({isMac: IS_MAC});

/**
 * Registers 1 or more shortcuts with handlers. Existing shortcuts with the same shortcut key
 * pattern will be replaced. Handlers are unregistered when the component unmounts.
 */
export function useShortcuts(shortcutsWithHandlers: ShortcutWithHandler[]): void {
  useEffect(() => {
    const unsubscribes = shortcutsWithHandlers.map(({shortcut, handler}) =>
      keyboardShortcutsService.registerShortcut(shortcut, handler)
    );
    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe());
    };
  }, [shortcutsWithHandlers]);
}

/**
 * Navigates to a URL when a shortcut is triggered. Included as a helper for a common use case.
 */
export function useNavShortcut(shortcut: KeyboardShortcut, navItemId: NavItemId): void {
  const navigate = useNavigate();

  const handleShortcut = useCallback(async (): Promise<void> => {
    switch (navItemId) {
      case NavItemId.All:
        await navigate({to: allViewRoute.fullPath});
        break;
      case NavItemId.Done:
        await navigate({to: doneViewRoute.fullPath});
        break;
      case NavItemId.Saved:
        await navigate({to: savedViewRoute.fullPath});
        break;
      case NavItemId.Starred:
        await navigate({to: starredViewRoute.fullPath});
        break;
      case NavItemId.Today:
        await navigate({to: todayViewRoute.fullPath});
        break;
      case NavItemId.Trashed:
        await navigate({to: trashedViewRoute.fullPath});
        break;
      case NavItemId.Unread:
        await navigate({to: unreadViewRoute.fullPath});
        break;
      case NavItemId.Untriaged:
        await navigate({to: untriagedViewRoute.fullPath});
        break;
      case NavItemId.Feeds:
        await navigate({to: feedSubscriptionsRoute.fullPath});
        break;
      case NavItemId.Import:
        await navigate({to: importRoute.fullPath});
        break;
      case NavItemId.Experiments:
        await navigate({to: experimentsRoute.fullPath});
        break;
      default:
        assertNever(navItemId);
    }
  }, [navigate, navItemId]);

  useShortcuts([{shortcut, handler: handleShortcut}]);
}
