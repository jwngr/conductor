import {useNavigate} from '@tanstack/react-router';
import {useCallback, useEffect} from 'react';

import {SharedKeyboardShortcutsService} from '@shared/services/keyboardShortcuts.shared';

import type {KeyboardShortcut, ShortcutHandler} from '@shared/types/shortcuts.types';
import type {NavItemId} from '@shared/types/urls.types';

import {IS_MAC} from '@sharedClient/lib/environment.client';

import {getNavItemRoute} from '@src/lib/router.pwa';

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
    const route = getNavItemRoute(navItemId);
    void navigate({to: route});
  }, [navigate, navItemId]);

  useShortcuts([{shortcut, handler: handleShortcut}]);
}
