// @ts-expect-error - tinykeys types are not properly exported
import {tinykeys} from 'tinykeys';

import {isModifierKey, ModifierKey} from '@shared/types/shortcuts.types';
import type {
  KeyboardShortcut,
  KeyboardShortcutsAdapter,
  ShortcutHandler,
  ShortcutKey,
} from '@shared/types/shortcuts.types';
import type {Task} from '@shared/types/utils.types';

/**
 * Web-specific adapter for handling keyboard shortcuts using tinykeys.
 */
export class WebKeyboardShortcutsAdapter implements KeyboardShortcutsAdapter {
  private readonly isMac: boolean;
  private readonly shortcutMap = new Map<string, Task>();

  constructor(args: {readonly isMac: boolean}) {
    this.isMac = args.isMac;
  }

  private convertKeyToTinykeysFormat(key: ShortcutKey): string {
    if (isModifierKey(key)) {
      switch (key) {
        case ModifierKey.Command:
          return this.isMac ? '$mod' : 'ctrl';
        case ModifierKey.Control:
          return 'ctrl';
        case ModifierKey.Enter:
          return 'enter';
        case ModifierKey.Option:
          return this.isMac ? 'alt' : 'alt';
        case ModifierKey.Shift:
          return '$shift';
      }
    }

    // For non-modifier keys, use lowercase
    return key.toLowerCase();
  }

  private convertToTinykeysPattern(shortcut: KeyboardShortcut): string {
    return shortcut.rawKeys.map(this.convertKeyToTinykeysFormat.bind(this)).join('+');
  }

  public registerShortcut(shortcut: KeyboardShortcut, handler: ShortcutHandler): Task {
    const pattern = this.convertToTinykeysPattern(shortcut);

    // Unsubscribe existing handler if any
    this.unregisterShortcut(shortcut.shortcutId);

    // Register new handler
    const unsubscribe = tinykeys(window, {
      [pattern]: (e: Event) => {
        e.preventDefault();
        handler();
      },
    });

    this.shortcutMap.set(shortcut.shortcutId, unsubscribe);
    return () => this.unregisterShortcut(shortcut.shortcutId);
  }

  public unregisterShortcut(shortcutId: string): void {
    const unsubscribe = this.shortcutMap.get(shortcutId);
    if (unsubscribe) {
      unsubscribe();
      this.shortcutMap.delete(shortcutId);
    }
  }
}
