import {
  FeedItemActionType,
  makeFeedItemId,
  TriageStatus,
  type FeedItem,
  type FeedItemAction,
} from '@shared/types/feedItems.types';
import {IconName} from '@shared/types/icons.types';
import type {Result} from '@shared/types/result.types';
import {makeSuccessResult} from '@shared/types/result.types';
import {KeyboardShortcutId} from '@shared/types/shortcuts.types';
import {SystemTagId} from '@shared/types/tags.types';

type MaybeFeedItem = FeedItem | undefined | null;

export class SharedFeedItemHelpers {
  public static isMarkedDone(feedItem: MaybeFeedItem): boolean {
    return feedItem?.triageStatus === TriageStatus.Done;
  }

  public static isSaved(feedItem: MaybeFeedItem): boolean {
    return feedItem?.triageStatus === TriageStatus.Saved;
  }

  public static isTrashed(feedItem: MaybeFeedItem): boolean {
    return feedItem?.triageStatus === TriageStatus.Trashed;
  }

  public static isStarred(feedItem: MaybeFeedItem): boolean {
    return feedItem?.tagIds[SystemTagId.Starred] === true;
  }

  public static isImporting(feedItem: MaybeFeedItem): boolean {
    return feedItem?.tagIds[SystemTagId.Importing] === true;
  }

  public static isUnread(feedItem: MaybeFeedItem): boolean {
    return feedItem?.tagIds[SystemTagId.Unread] === true;
  }

  public static makeFeedItem(
    args: Pick<FeedItem, 'type' | 'userId' | 'url' | 'source' | 'createdTime' | 'lastUpdatedTime'>
  ): Result<FeedItem> {
    return makeSuccessResult({
      feedItemId: makeFeedItemId(),
      userId: args.userId,
      url: args.url,
      type: args.type,
      source: args.source,
      title: '',
      description: '',
      outgoingLinks: [],
      triageStatus: TriageStatus.Untriaged,
      tagIds: {
        [SystemTagId.Unread]: true,
        [SystemTagId.Importing]: true,
      },
      createdTime: args.createdTime,
      lastUpdatedTime: args.lastUpdatedTime,
    });
  }

  public static getMarkDoneFeedItemActionInfo(feedItem: FeedItem): FeedItemAction {
    const isAlreadyDone = SharedFeedItemHelpers.isMarkedDone(feedItem);
    return {
      type: FeedItemActionType.MarkDone,
      text: isAlreadyDone ? 'Mark undone' : 'Mark done',
      icon: IconName.MarkDone, // TODO: Make icon dynamic.
      shortcutId: KeyboardShortcutId.ToggleDone,
    };
  }

  public static getSaveFeedItemActionInfo(feedItem: FeedItem): FeedItemAction {
    const isAlreadySaved = SharedFeedItemHelpers.isSaved(feedItem);
    return {
      type: FeedItemActionType.Save,
      text: isAlreadySaved ? 'Unsave' : 'Save',
      icon: IconName.Save,
      shortcutId: KeyboardShortcutId.ToggleSaved,
    };
  }

  public static getMarkUnreadFeedItemActionInfo(feedItem: FeedItem): FeedItemAction {
    const isAlreadyUnread = SharedFeedItemHelpers.isUnread(feedItem);
    return {
      type: FeedItemActionType.MarkUnread,
      text: isAlreadyUnread ? 'Mark read' : 'Mark unread',
      icon: IconName.MarkUnread,
      shortcutId: KeyboardShortcutId.ToggleUnread,
    };
  }

  public static getStarFeedItemActionInfo(feedItem: FeedItem): FeedItemAction {
    const isAlreadyStarred = SharedFeedItemHelpers.isStarred(feedItem);
    return {
      type: FeedItemActionType.Star,
      text: isAlreadyStarred ? 'Unstar' : 'Star',
      icon: IconName.Star,
      shortcutId: KeyboardShortcutId.ToggleStarred,
    };
  }
}
