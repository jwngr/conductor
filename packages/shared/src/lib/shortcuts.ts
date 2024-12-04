import {tinykeys} from 'tinykeys';

import {assertNever} from '@shared/lib/utils';

import {
  isModifierKey,
  KeyboardShortcut,
  KeyboardShortcutId,
  ModifierKey,
  RegisteredShortcut,
  ShortcutHandler,
  ShortcutKey,
} from '@shared/types/shortcuts.types';
import {Task} from '@shared/types/utils.types';

interface KeyboardShortcutsServiceArgs {
  readonly isMac: boolean;
}

export class KeyboardShortcutsService {
  private isMac: boolean;
  private readonly registeredShortcuts = new Map<KeyboardShortcutId, RegisteredShortcut>();
  private unsubscribeTinykeys?: Task;

  constructor({isMac}: KeyboardShortcutsServiceArgs) {
    this.isMac = isMac;
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

  private setupTinykeys(): void {
    if (this.unsubscribeTinykeys) {
      this.unsubscribeTinykeys();
    }

    const shortcutMap: Record<string, (e: Event) => void> = {};

    this.registeredShortcuts.forEach(({shortcut, handler}) => {
      shortcutMap[shortcut.keyPattern] = (e: Event) => {
        e.preventDefault();
        handler();
      };
    });

    this.unsubscribeTinykeys = tinykeys(window, shortcutMap);
  }

  public registerShortcut(shortcut: KeyboardShortcut, handler: ShortcutHandler): void {
    this.registeredShortcuts.set(shortcut.shortcutId, {shortcut, handler});
    this.setupTinykeys();
  }

  public unregisterShortcut(shortcutId: KeyboardShortcutId): void {
    this.registeredShortcuts.delete(shortcutId);
    this.setupTinykeys();
  }

  public cleanup(): void {
    this.unsubscribeTinykeys?.();
    this.registeredShortcuts.clear();
  }
}
