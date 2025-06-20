import type {Supplier, Task} from '@shared/types/utils.types';

/**
 * Unique identifier for a keyboard shortcut.
 */
export enum KeyboardShortcutId {
  ToggleDone = 'TOGGLE_DONE',
  ToggleSaved = 'TOGGLE_SAVED',
  ToggleStarred = 'TOGGLE_STARRED',
  ToggleTrashed = 'TOGGLE_TRASHED',
  ToggleUnread = 'TOGGLE_UNREAD',
  Close = 'ESCAPE',
  ArrowDown = 'ARROW_DOWN',
  ArrowUp = 'ARROW_UP',
  Enter = 'ENTER',
}

/**
 * Platform-agnostic modifier keys that can be used in keyboard shortcuts.
 */
export enum ModifierKey {
  Command = 'COMMAND',
  Control = 'CONTROL',
  Enter = 'ENTER',
  Option = 'OPTION',
  Shift = 'SHIFT',
}

export type ShortcutKey = ModifierKey | string;

export function isModifierKey(key: ShortcutKey): key is ModifierKey {
  return Object.values(ModifierKey).includes(key as ModifierKey);
}

/**
 * Platform-agnostic interface for handling keyboard shortcuts across different platforms.
 */
export interface KeyboardShortcutsAdapter {
  readonly registerShortcut: (shortcut: KeyboardShortcut, handler: ShortcutHandler) => Task;
  readonly unregisterShortcut: (shortcutId: KeyboardShortcutId) => void;
}

/**
 * Full representation of a keyboard shortcut, with platform-agnostic keys.
 */
export interface KeyboardShortcut {
  readonly shortcutId: KeyboardShortcutId;
  /** Platform-specific strings shown in the UI (e.g. ["D"] or ["⌘", "Shift", "S"]) */
  readonly displayKeys: readonly string[];
  /** Raw keys in a platform-agnostic format (e.g. ["D"] or ["COMMAND", "SHIFT", "S"]) */
  readonly rawKeys: readonly ShortcutKey[];
}

export type ShortcutHandler = Supplier<Promise<void>>;

export interface ShortcutWithHandler {
  readonly shortcut: KeyboardShortcut;
  readonly handler: ShortcutHandler;
}
