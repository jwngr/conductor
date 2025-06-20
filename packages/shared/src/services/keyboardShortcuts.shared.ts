import {assertNever} from '@shared/lib/utils.shared';

import type {
  KeyboardShortcut,
  KeyboardShortcutsAdapter,
  ShortcutHandler,
  ShortcutKey,
  ShortcutWithHandler,
} from '@shared/types/shortcuts.types';
import {isModifierKey, KeyboardShortcutId, ModifierKey} from '@shared/types/shortcuts.types';
import type {Unsubscribe} from '@shared/types/utils.types';

export class SharedKeyboardShortcutsService {
  private readonly isMac: boolean;
  private readonly adapter: KeyboardShortcutsAdapter;
  private readonly registeredShortcuts = new Map<KeyboardShortcutId, ShortcutWithHandler>();

  constructor(args: {readonly adapter: KeyboardShortcutsAdapter; readonly isMac: boolean}) {
    this.adapter = args.adapter;
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

  private getPlatformSpecificKeys(keys: readonly ShortcutKey[]): string[] {
    return keys.map(this.getPlatformSpecificKey.bind(this));
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
    const rawKeys = ['D'];
    return {
      shortcutId: KeyboardShortcutId.ToggleDone,
      displayKeys: this.getPlatformSpecificKeys(rawKeys),
      rawKeys,
    };
  }

  public forToggleSaved(): KeyboardShortcut {
    const rawKeys = ['B'];
    return {
      shortcutId: KeyboardShortcutId.ToggleSaved,
      displayKeys: this.getPlatformSpecificKeys(rawKeys),
      rawKeys,
    };
  }

  public forToggleStarred(): KeyboardShortcut {
    const rawKeys = ['S'];
    return {
      shortcutId: KeyboardShortcutId.ToggleStarred,
      displayKeys: this.getPlatformSpecificKeys(rawKeys),
      rawKeys,
    };
  }

  public forToggleTrashed(): KeyboardShortcut {
    const rawKeys = ['#'];
    return {
      shortcutId: KeyboardShortcutId.ToggleTrashed,
      displayKeys: this.getPlatformSpecificKeys(rawKeys),
      rawKeys,
    };
  }

  public forToggleUnread(): KeyboardShortcut {
    const rawKeys = ['U'];
    return {
      shortcutId: KeyboardShortcutId.ToggleUnread,
      displayKeys: this.getPlatformSpecificKeys(rawKeys),
      rawKeys,
    };
  }

  public forClose(): KeyboardShortcut {
    const rawKeys = ['Esc'];
    return {
      shortcutId: KeyboardShortcutId.Close,
      displayKeys: this.getPlatformSpecificKeys(rawKeys),
      rawKeys,
    };
  }

  public forArrowUp(): KeyboardShortcut {
    const rawKeys = ['↑'];
    return {
      shortcutId: KeyboardShortcutId.ArrowUp,
      displayKeys: this.getPlatformSpecificKeys(rawKeys),
      rawKeys,
    };
  }

  public forArrowDown(): KeyboardShortcut {
    const rawKeys = ['↓'];
    return {
      shortcutId: KeyboardShortcutId.ArrowDown,
      displayKeys: this.getPlatformSpecificKeys(rawKeys),
      rawKeys,
    };
  }

  public forEnter(): KeyboardShortcut {
    const rawKeys = ['↵'];
    return {
      shortcutId: KeyboardShortcutId.Enter,
      displayKeys: this.getPlatformSpecificKeys(rawKeys),
      rawKeys,
    };
  }

  public registerShortcut(shortcut: KeyboardShortcut, handler: ShortcutHandler): Unsubscribe {
    this.registeredShortcuts.set(shortcut.shortcutId, {shortcut, handler});
    return this.adapter.registerShortcut(shortcut, handler);
  }
}
