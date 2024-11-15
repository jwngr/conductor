import {FeedItemsService} from '@shared/lib/feedItems';
import {assertNever} from '@shared/lib/utils';

import {FeedItem} from '@shared/types/feedItems.types';
import {
  isModifierKey,
  KeyboardShortcut,
  KeyboardShortcutId,
  ModifierKey,
  ShortcutKey,
} from '@shared/types/shortcuts.types';

interface ToggleDoneKeyboardShortcut extends KeyboardShortcut {
  readonly shortcutId: KeyboardShortcutId.ToggleDone;
}

interface ToggleSavedKeyboardShortcut extends KeyboardShortcut {
  readonly shortcutId: KeyboardShortcutId.ToggleSaved;
}

interface ToggleStarredKeyboardShortcut extends KeyboardShortcut {
  readonly shortcutId: KeyboardShortcutId.ToggleStarred;
}

interface ToggleTrashedKeyboardShortcut extends KeyboardShortcut {
  readonly shortcutId: KeyboardShortcutId.ToggleTrashed;
}

interface ToggleUnreadKeyboardShortcut extends KeyboardShortcut {
  readonly shortcutId: KeyboardShortcutId.ToggleUnread;
}

interface KeyboardShortcutsServiceArgs {
  readonly isMac: boolean;
}

export class KeyboardShortcutsService {
  private isMac: boolean;

  constructor({isMac}: KeyboardShortcutsServiceArgs) {
    this.isMac = isMac;
  }

  private getPlatformSpecificKey(key: ShortcutKey): string {
    // Map modifier keys to the correct platform-specific keys.
    if (isModifierKey(key)) {
      switch (key) {
        case ModifierKey.Control:
          return this.isMac ? 'Cmd' : 'Ctrl';
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
    // Don't re-map normal string keys.
    return key;
  }

  private getPlatformSpecificKeys(keys: ShortcutKey[]): string[] {
    return keys.map(this.getPlatformSpecificKey);
  }

  public forToggleDone(feedItem: FeedItem): ToggleDoneKeyboardShortcut {
    const isAlreadyDone = FeedItemsService.isMarkedDone(feedItem);
    return {
      shortcutId: KeyboardShortcutId.ToggleDone,
      text: isAlreadyDone ? 'Mark done' : 'Mark undone',
      shorcutKeys: this.getPlatformSpecificKeys(['d']),
    };
  }

  public forToggleSaved(feedItem: FeedItem): ToggleSavedKeyboardShortcut {
    const isAlreadySaved = FeedItemsService.isSaved(feedItem);
    return {
      shortcutId: KeyboardShortcutId.ToggleSaved,
      text: isAlreadySaved ? 'Save' : 'Unsave',
      shorcutKeys: this.getPlatformSpecificKeys(['b']),
    };
  }

  public forToggleStarred(feedItem: FeedItem): ToggleStarredKeyboardShortcut {
    const isAlreadyStarred = FeedItemsService.isStarred(feedItem);
    return {
      shortcutId: KeyboardShortcutId.ToggleStarred,
      text: isAlreadyStarred ? 'Star' : 'Unstar',
      shorcutKeys: this.getPlatformSpecificKeys(['s']),
    };
  }

  public forToggleTrashed(feedItem: FeedItem): ToggleTrashedKeyboardShortcut {
    const isAlreadyTrashed = FeedItemsService.isTrashed(feedItem);
    return {
      shortcutId: KeyboardShortcutId.ToggleTrashed,
      text: isAlreadyTrashed ? 'Trash' : 'Untrash',
      shorcutKeys: this.getPlatformSpecificKeys(['#']),
    };
  }

  public forToggleUnread(feedItem: FeedItem): ToggleUnreadKeyboardShortcut {
    const isAlreadyUnread = FeedItemsService.isUnread(feedItem);
    return {
      shortcutId: KeyboardShortcutId.ToggleUnread,
      text: isAlreadyUnread ? 'Mark read' : 'Mark unread',
      shorcutKeys: this.getPlatformSpecificKeys(['u']),
    };
  }
}
