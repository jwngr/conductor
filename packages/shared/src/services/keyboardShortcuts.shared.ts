import {tinykeys} from 'tinykeys';

import {assertNever} from '@shared/lib/utils.shared';

import type {
  KeyboardShortcut,
  RegisteredShortcut,
  ShortcutHandler,
  ShortcutKey,
} from '@shared/types/shortcuts.types';
import {isModifierKey, KeyboardShortcutId, ModifierKey} from '@shared/types/shortcuts.types';
import type {Task, Unsubscribe} from '@shared/types/utils.types';

export class SharedKeyboardShortcutsService {
  private isMac: boolean;
  private readonly registeredShortcuts = new Map<KeyboardShortcutId, RegisteredShortcut>();
  private unsubscribeTinykeys?: Task;

  constructor(args: {readonly isMac: boolean}) {
    this.isMac = args.isMac;
  }

  private getPlatformSpecificKey(key: ShortcutKey): string {
    // Map modifier keys to the correct platform-specific keys.
    if (isModifierKey(key)) {
      switch (key) {
        case ModifierKey.Command:
          return this.isMac ? 'Cmd' : 'Ctrl';
        case ModifierKey.Control:
          return 'Ctrl';
        case ModifierKey.Enter:
          return 'Enter';
        case ModifierKey.Option:
          return this.isMac ? 'Option' : 'Alt';
        case ModifierKey.Shift:
          return 'Shift';
        default:
          assertNever(key);
      }
    }
    // Re-map all other keys to uppercase.
    return key.toUpperCase();
  }

  private getPlatformSpecificKeys(keys: ShortcutKey[]): string[] {
    return keys.map(this.getPlatformSpecificKey);
  }

  public getShortcut(shortcutId: KeyboardShortcutId): KeyboardShortcut {
    switch (shortcutId) {
      case KeyboardShortcutId.ToggleDone:
        return this.forToggleDone();
      case KeyboardShortcutId.ToggleSaved:
        return this.forToggleSaved();
      case KeyboardShortcutId.ToggleStarred:
        return this.forToggleStarred();
      case KeyboardShortcutId.ToggleTrashed:
        return this.forToggleTrashed();
      case KeyboardShortcutId.ToggleUnread:
        return this.forToggleUnread();
      case KeyboardShortcutId.Close:
        return this.forClose();
      case KeyboardShortcutId.ArrowDown:
        return this.forArrowDown();
      case KeyboardShortcutId.ArrowUp:
        return this.forArrowUp();
      case KeyboardShortcutId.Enter:
        return this.forEnter();
      default:
        assertNever(shortcutId);
    }
  }

  public forToggleDone(): KeyboardShortcut {
    return {
      shortcutId: KeyboardShortcutId.ToggleDone,
      displayKeys: this.getPlatformSpecificKeys(['D']),
      keyPattern: 'd',
    };
  }

  public forToggleSaved(): KeyboardShortcut {
    return {
      shortcutId: KeyboardShortcutId.ToggleSaved,
      displayKeys: this.getPlatformSpecificKeys(['B']),
      keyPattern: 'b',
    };
  }

  public forToggleStarred(): KeyboardShortcut {
    return {
      shortcutId: KeyboardShortcutId.ToggleStarred,
      displayKeys: this.getPlatformSpecificKeys(['S']),
      keyPattern: 's',
    };
  }

  public forToggleTrashed(): KeyboardShortcut {
    return {
      shortcutId: KeyboardShortcutId.ToggleTrashed,
      displayKeys: this.getPlatformSpecificKeys(['#']),
      keyPattern: '#',
    };
  }

  public forToggleUnread(): KeyboardShortcut {
    return {
      shortcutId: KeyboardShortcutId.ToggleUnread,
      displayKeys: this.getPlatformSpecificKeys(['U']),
      keyPattern: 'u',
    };
  }

  public forClose(): KeyboardShortcut {
    return {
      shortcutId: KeyboardShortcutId.Close,
      displayKeys: this.getPlatformSpecificKeys(['Esc']),
      keyPattern: 'Escape',
    };
  }

  public forArrowUp(): KeyboardShortcut {
    return {
      shortcutId: KeyboardShortcutId.ArrowUp,
      displayKeys: this.getPlatformSpecificKeys(['↑']),
      keyPattern: 'ArrowUp',
    };
  }

  public forArrowDown(): KeyboardShortcut {
    return {
      shortcutId: KeyboardShortcutId.ArrowDown,
      displayKeys: this.getPlatformSpecificKeys(['↓']),
      keyPattern: 'ArrowDown',
    };
  }

  public forEnter(): KeyboardShortcut {
    return {
      shortcutId: KeyboardShortcutId.Enter,
      displayKeys: this.getPlatformSpecificKeys(['↵']),
      keyPattern: 'Enter',
    };
  }

  private refreshActiveShortcuts(): void {
    if (this.unsubscribeTinykeys) {
      this.unsubscribeTinykeys();
    }

    const shortcutMap: Record<string, (e: Event) => Promise<void>> = {};

    this.registeredShortcuts.forEach(({shortcut, handler}) => {
      shortcutMap[shortcut.keyPattern] = async (e: Event) => {
        e.preventDefault();
        await handler();
      };
    });

    this.unsubscribeTinykeys = tinykeys(window, shortcutMap);
  }

  public registerShortcut(shortcut: KeyboardShortcut, handler: ShortcutHandler): Unsubscribe {
    this.registeredShortcuts.set(shortcut.shortcutId, {shortcut, handler});
    this.refreshActiveShortcuts();

    // Return a function to unregister the shortcut.
    return () => {
      this.registeredShortcuts.delete(shortcut.shortcutId);
      this.refreshActiveShortcuts();
    };
  }
}
