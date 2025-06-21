import {makeErrorResult, makeSuccessResult} from '@shared/lib/results.shared';
import {parseUrl} from '@shared/lib/urls.shared';
import {assertNever, makeUuid} from '@shared/lib/utils.shared';

import type {AccountId} from '@shared/types/accounts.types';
import {FeedItemContentType} from '@shared/types/feedItemContent.types';
import type {FeedItemContent} from '@shared/types/feedItemContent.types';
import {
  FeedItemActionType,
  FeedItemImportStatus,
  TriageStatus,
} from '@shared/types/feedItems.types';
import type {
  FeedItem,
  FeedItemAction,
  FeedItemId,
  NewFeedItemImportState,
} from '@shared/types/feedItems.types';
import type {Feed} from '@shared/types/feeds.types';
import {FeedType} from '@shared/types/feedSourceTypes.types';
import type {FeedSubscriptionId} from '@shared/types/feedSubscriptions.types';
import {IconName} from '@shared/types/icons.types';
import type {Result} from '@shared/types/results.types';
import {KeyboardShortcutId} from '@shared/types/shortcuts.types';
import {SystemTagId} from '@shared/types/tags.types';

export const DEFAULT_FEED_ITEM_CONTENT_TYPE = FeedItemContentType.Article;

type MaybeFeedItem = FeedItem | undefined | null;

/**
 * Creates a new random {@link FeedItemId}.
 */
export function makeFeedItemId(): FeedItemId {
  return makeUuid<FeedItemId>();
}

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

  public static isUnread(feedItem: MaybeFeedItem): boolean {
    return feedItem?.tagIds[SystemTagId.Unread] === true;
  }

  public static getMarkDoneFeedItemActionInfo(feedItem: FeedItem): FeedItemAction {
    const isAlreadyDone = SharedFeedItemHelpers.isMarkedDone(feedItem);
    return {
      actionType: isAlreadyDone ? FeedItemActionType.MarkUndone : FeedItemActionType.MarkDone,
      text: isAlreadyDone ? 'Mark undone' : 'Mark done',
      icon: IconName.MarkDone, // TODO: Make icon dynamic.
      shortcutId: KeyboardShortcutId.ToggleDone,
    };
  }

  public static getSaveFeedItemActionInfo(feedItem: FeedItem): FeedItemAction {
    const isAlreadySaved = SharedFeedItemHelpers.isSaved(feedItem);
    return {
      actionType: isAlreadySaved ? FeedItemActionType.Unsave : FeedItemActionType.Save,
      text: isAlreadySaved ? 'Unsave' : 'Save',
      icon: IconName.Save,
      shortcutId: KeyboardShortcutId.ToggleSaved,
    };
  }

  public static getMarkUnreadFeedItemActionInfo(feedItem: FeedItem): FeedItemAction {
    const isAlreadyUnread = SharedFeedItemHelpers.isUnread(feedItem);
    return {
      actionType: isAlreadyUnread ? FeedItemActionType.MarkRead : FeedItemActionType.MarkUnread,
      text: isAlreadyUnread ? 'Mark read' : 'Mark unread',
      icon: IconName.MarkUnread,
      shortcutId: KeyboardShortcutId.ToggleUnread,
    };
  }

  public static getStarFeedItemActionInfo(feedItem: FeedItem): FeedItemAction {
    const isAlreadyStarred = SharedFeedItemHelpers.isStarred(feedItem);
    return {
      actionType: isAlreadyStarred ? FeedItemActionType.Unstar : FeedItemActionType.Star,
      text: isAlreadyStarred ? 'Unstar' : 'Star',
      icon: IconName.Star,
      shortcutId: KeyboardShortcutId.ToggleStarred,
    };
  }

  public static getRetryImportFeedItemActionInfo(): FeedItemAction {
    return {
      actionType: FeedItemActionType.RetryImport,
      text: 'Retry import',
      icon: IconName.RetryImport,
    };
  }

  public static getCancelFeedItemActionInfo(): FeedItemAction {
    return {
      actionType: FeedItemActionType.Cancel,
      text: 'Cancel',
      icon: IconName.Cancel,
    };
  }

  public static validateUrl(url: string): Result<void, Error> {
    const parsedUrl = parseUrl(url);
    if (!parsedUrl) {
      return makeErrorResult(new Error('Invalid URL'));
    }

    // Only allow HTTPS protocols.
    // TODO: Consider allowing other protocols like `http:` and `chrome:` as well.
    if (!['https:'].includes(parsedUrl.protocol)) {
      return makeErrorResult(new Error('Only HTTPS URLs allowed'));
    }

    // Prevent localhost and private IP addresses.
    const hostname = parsedUrl.hostname.toLowerCase();
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '0.0.0.0' ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('10.') ||
      hostname.startsWith('172.16.') ||
      hostname.startsWith('169.254.') ||
      hostname.endsWith('.local')
    ) {
      return makeErrorResult(new Error('URL cannot point to localhost or private networks'));
    }

    return makeSuccessResult(undefined);
  }

  public static hasEverBeenImported(feedItem: FeedItem): boolean {
    return feedItem.importState.lastSuccessfulImportTime !== null;
  }
}

export function makeFeedItem(args: {
  origin: Feed;
  accountId: AccountId;
  content: FeedItemContent;
}): FeedItem {
  const {origin, accountId, content} = args;

  return {
    feedItemContentType: content.feedItemContentType,
    feedItemId: makeFeedItemId(),
    content,
    origin,
    accountId,
    importState: makeNewFeedItemImportState(),
    triageStatus: TriageStatus.Untriaged,
    tagIds: {[SystemTagId.Unread]: true},
    // TODO(timestamps): Use server timestamps instead.
    createdTime: new Date(),
    lastUpdatedTime: new Date(),
    // TODO(types): Remove this cast.
  } as FeedItem;
}

export function makeNewFeedItemImportState(): NewFeedItemImportState {
  return {
    status: FeedItemImportStatus.New,
    shouldFetch: true,
    lastImportRequestedTime: new Date(),
    lastSuccessfulImportTime: null,
  };
}

export function getFeedSubscriptionIdForItem(feedItem: FeedItem): FeedSubscriptionId | null {
  switch (feedItem.origin.feedType) {
    case FeedType.RSS:
    case FeedType.YouTubeChannel:
    case FeedType.Interval:
      return feedItem.origin.feedSubscriptionId;
    case FeedType.PWA:
    case FeedType.Extension:
    case FeedType.PocketExport:
      return null;
    default:
      assertNever(feedItem.origin);
  }
}
