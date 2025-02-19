import {useEffect} from 'react';
import {useNavigate} from 'react-router-dom';

import {SharedKeyboardShortcutsService} from '@shared/services/keyboardShortcuts.shared';

import type {KeyboardShortcut, ShortcutHandler} from '@shared/types/shortcuts.types';

import {IS_MAC} from '@src/lib/environment.pwa';

interface ShortcutWithHandler {
  readonly shortcut: KeyboardShortcut;
  readonly handler: ShortcutHandler;
}

export const keyboardShortcutsService = new SharedKeyboardShortcutsService({isMac: IS_MAC});

/**
 * Registers a shortcut with a handler. Existing shortcuts with the same shortcut key pattern will
 * be replaced. Handler is unregistered when the component unmounts.
 */
export function useShortcut(shortcut: KeyboardShortcut, handler: ShortcutHandler): void {
  useEffect(() => {
    return keyboardShortcutsService.registerShortcut(shortcut, handler);
  }, [shortcut, handler]);
}

/**
 * Registers multiple shortcuts with handlers. Existing shortcuts with the same shortcut key
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
export function useNavShortcut(shortcut: KeyboardShortcut, url: string): void {
  const navigate = useNavigate();
  useShortcut(shortcut, () => navigate(url));
}
