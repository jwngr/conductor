import {Task} from '@shared/types/utils.types';

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
}

/**
 * Universal representation of a non-platform-specific shortcut key. These will get mapped to
 * platform-specific strings.
 */
export enum ModifierKey {
  Control = 'CONTROL',
  Enter = 'ENTER',
  Option = 'OPTION',
  Shift = 'SHIFT',
}

const ALL_MODIFIER_KEYS: Record<ModifierKey, true> = {
  [ModifierKey.Control]: true,
  [ModifierKey.Enter]: true,
  [ModifierKey.Option]: true,
  [ModifierKey.Shift]: true,
};

export function isModifierKey(maybeModifierKey: string): maybeModifierKey is ModifierKey {
  return (
    maybeModifierKey in ALL_MODIFIER_KEYS &&
    // TODO: Is the `as` needed here?
    ALL_MODIFIER_KEYS[maybeModifierKey as ModifierKey] === true
  );
}

/**
 * Universal representation of a non-platform-specific shortcut key. Can either be a string (for
 * single alphanumeric or other basic characters shared across platform) or a `ModifierKey` (for
 * special characters which are platform-specific).
 */
export type ShortcutKey = string | ModifierKey;

/**
 * Full representation of a keyboard shortcut, with platform-specific keys.
 */
export interface KeyboardShortcut {
  readonly shortcutId: KeyboardShortcutId;
  /** Platform-specific strings shown in the UI (e.g. ["D"] or ["⌘", "Shift", "S"]) */
  readonly displayKeys: readonly string[];
  /** Keyboard pattern registered with tinykeys (e.g. 'd' or '$mod+$shift+s'). */
  readonly keyPattern: string;
}

export type ShortcutHandler = Task;

export interface RegisteredShortcut {
  readonly shortcut: KeyboardShortcut;
  readonly handler: ShortcutHandler;
}