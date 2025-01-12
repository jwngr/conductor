import {useEffect} from 'react';
import {useNavigate} from 'react-router-dom';

import {SharedKeyboardShortcutsService} from '@shared/services/keyboardShortcuts.shared';

import type {KeyboardShortcut, ShortcutHandler} from '@shared/types/shortcuts.types';

import {IS_MAC} from '@src/lib/environment.pwa';

export const keyboardShortcutsService = new SharedKeyboardShortcutsService({isMac: IS_MAC});

export function useShortcut(shortcut: KeyboardShortcut, handler: ShortcutHandler) {
  useEffect(() => {
    return keyboardShortcutsService.registerShortcut(shortcut, handler);
  }, [shortcut, handler]);
}

export function useNavShortcut(shortcut: KeyboardShortcut, url: string) {
  const navigate = useNavigate();
  useShortcut(shortcut, () => navigate(url));
}

interface ShortcutWithHandler {
  readonly shortcut: KeyboardShortcut;
  readonly handler: ShortcutHandler;
}

export function useShortcuts(shortcutsWithHandlers: ShortcutWithHandler[]) {
  useEffect(() => {
    const unsubscribes = shortcutsWithHandlers.map(({shortcut, handler}) =>
      keyboardShortcutsService.registerShortcut(shortcut, handler)
    );
    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe());
    };
  }, [shortcutsWithHandlers]);
}
