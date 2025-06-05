import {logger} from '@shared/services/logger.shared';

import {prefixError, upgradeUnknownError} from '@shared/lib/errorUtils.shared';
import {makeErrorResult, makeSuccessResult} from '@shared/lib/results.shared';
import {parseUrl} from '@shared/lib/urls.shared';
import {assertNever, makeUuid} from '@shared/lib/utils.shared';
import {isXkcdComicUrl} from '@shared/lib/xkcd.shared';
import {isYouTubeVideoUrl} from '@shared/lib/youtube.shared';

import type {DeliverySchedule} from '@shared/types/deliverySchedules.types';
import {
  FeedItemActionType,
  FeedItemContentType,
  FeedItemImportStatus,
  TriageStatus,
} from '@shared/types/feedItems.types';
import type {
  FeedItem,
  FeedItemAction,
  FeedItemId,
  FeedItemWithUrlContent,
  IntervalFeedItem,
  IntervalFeedItemContent,
  NewFeedItemImportState,
  XkcdFeedItem,
  XkcdFeedItemContent,
} from '@shared/types/feedItems.types';
import {IconName} from '@shared/types/icons.types';
import type {Result} from '@shared/types/results.types';
import {KeyboardShortcutId} from '@shared/types/shortcuts.types';
import {SystemTagId} from '@shared/types/tags.types';
import type {
  UserFeedSubscription,
  UserFeedSubscriptionId,
} from '@shared/types/userFeedSubscriptions.types';

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

  public static makeFeedItem(
    args: Pick<FeedItem, 'feedItemContentType' | 'feedSource' | 'accountId' | 'content'>
  ): FeedItem {
    const {feedItemContentType, feedSource, accountId, content} = args;

    switch (feedItemContentType) {
      case FeedItemContentType.Article:
      case FeedItemContentType.Video:
      case FeedItemContentType.Tweet:
      case FeedItemContentType.Website:
      case FeedItemContentType.YouTube:
        return SharedFeedItemHelpers.makeFeedItemWithUrl({
          feedItemContentType,
          feedSource,
          accountId,
          content: content as FeedItemWithUrlContent,
        });
      case FeedItemContentType.Xkcd:
        return SharedFeedItemHelpers.makeXkcdFeedItem({
          feedSource,
          accountId,
          content: content as XkcdFeedItemContent,
        });
      case FeedItemContentType.Interval:
        return SharedFeedItemHelpers.makeIntervalFeedItem({
          feedSource,
          accountId,
          content: content as IntervalFeedItemContent,
        });
      default:
        assertNever(feedItemContentType);
    }
  }

  private static makeGenericFeedItem<T extends FeedItem>(
    args: Pick<T, 'feedItemContentType' | 'feedSource' | 'accountId' | 'content'>
  ): T {
    const {feedItemContentType, feedSource, accountId, content} = args;

    return {
      feedItemContentType,
      content,
      feedSource,
      accountId,
      feedItemId: makeFeedItemId(),
      importState: makeNewFeedItemImportState(),
      triageStatus: TriageStatus.Untriaged,
      tagIds: {[SystemTagId.Unread]: true},
      // TODO(timestamps): Use server timestamps instead.
      createdTime: new Date(),
      lastUpdatedTime: new Date(),
    } as T;
  }

  public static makeXkcdFeedItem(
    args: Pick<XkcdFeedItem, 'feedSource' | 'accountId' | 'content'>
  ): XkcdFeedItem {
    const {feedSource, accountId, content} = args;

    return SharedFeedItemHelpers.makeGenericFeedItem({
      feedItemContentType: FeedItemContentType.Xkcd,
      feedSource,
      accountId,
      content,
    });
  }

  public static makeIntervalFeedItem(
    args: Pick<IntervalFeedItem, 'feedSource' | 'accountId' | 'content'>
  ): IntervalFeedItem {
    const {feedSource, accountId, content} = args;

    return SharedFeedItemHelpers.makeGenericFeedItem({
      feedItemContentType: FeedItemContentType.Interval,
      feedSource,
      accountId,
      content,
    });
  }

  public static makeFeedItemWithUrl(
    args: Pick<FeedItem, 'feedItemContentType' | 'feedSource' | 'accountId'> & {
      content: FeedItemWithUrlContent;
    }
  ): FeedItem {
    const {feedItemContentType, feedSource, accountId, content} = args;

    return SharedFeedItemHelpers.makeGenericFeedItem({
      feedItemContentType,
      feedSource,
      accountId,
      content,
    });
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

  public static validateUrl(url: string): Result<void> {
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

export function findDeliveryScheduleForFeedSubscription(args: {
  readonly userFeedSubscriptionId: UserFeedSubscriptionId;
  readonly userFeedSubscriptions: UserFeedSubscription[];
}): DeliverySchedule | null {
  const {userFeedSubscriptionId, userFeedSubscriptions} = args;
  const matchingUserFeedSubscription = userFeedSubscriptions.find(
    (subscription) => subscription.userFeedSubscriptionId === userFeedSubscriptionId
  );
  return matchingUserFeedSubscription?.deliverySchedule ?? null;
}

/**
 * Uses heuristics to determine what {@link FeedItemContentType} a URL is likely to be. This is used to
 * determine which renderer to use when rendering a feed item.
 */
export function getFeedItemTypeFromUrl(
  url: string
): Exclude<FeedItemContentType, FeedItemContentType.Interval> {
  // Parsing the URL may throw. If it does, ignore the error and just use a default value.
  let parsedUrl: URL;
  // eslint-disable-next-line no-restricted-syntax
  try {
    parsedUrl = new URL(url);
  } catch (error) {
    const betterError = upgradeUnknownError(error);
    logger.error(prefixError(betterError, 'Error parsing feed item type from URL'), {error, url});
    return FeedItemContentType.Website;
  }

  const hostname = parsedUrl.hostname.toLowerCase();

  // Check for exact matches against allowed hostnames.
  const twitterHosts = ['twitter.com', 'www.twitter.com', 'x.com', 'www.x.com'];
  if (isYouTubeVideoUrl(parsedUrl.href)) {
    return FeedItemContentType.YouTube;
  } else if (isXkcdComicUrl(parsedUrl.href)) {
    return FeedItemContentType.Xkcd;
  } else if (twitterHosts.includes(hostname)) {
    return FeedItemContentType.Tweet;
  }

  // Default to article.
  return FeedItemContentType.Article;
}

export function makeNewFeedItemImportState(): NewFeedItemImportState {
  return {
    status: FeedItemImportStatus.New,
    shouldFetch: true,
    lastImportRequestedTime: new Date(),
    lastSuccessfulImportTime: null,
  };
}
