import type {IconName} from '@shared/types/icons.types';
import type {KeyboardShortcutId} from '@shared/types/shortcuts.types';

export enum FeedItemActionType {
  Cancel = 'CANCEL',
  MarkDone = 'MARK_DONE',
  MarkUndone = 'MARK_UNDONE',
  MarkRead = 'MARK_READ',
  MarkUnread = 'MARK_UNREAD',
  Save = 'SAVE',
  Unsave = 'UNSAVE',
  Star = 'STAR',
  Unstar = 'UNSTAR',
  RetryImport = 'RETRY_IMPORT',
  Undo = 'UNDO',
}

export interface FeedItemAction {
  readonly actionType: FeedItemActionType;
  // TODO: Should this have `feedId` on it? Should it be optional?
  readonly text: string;
  readonly icon: IconName;
  readonly shortcutId?: KeyboardShortcutId;
}
