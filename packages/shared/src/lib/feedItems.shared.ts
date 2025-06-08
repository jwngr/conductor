import {logger} from '@shared/services/logger.shared';

import {prefixErrorResult, syncTry} from '@shared/lib/errorUtils.shared';
import {makeErrorResult, makeSuccessResult} from '@shared/lib/results.shared';
import {parseUrl} from '@shared/lib/urls.shared';
import {assertNever, makeUuid} from '@shared/lib/utils.shared';
import {isXkcdComicUrl} from '@shared/lib/xkcd.shared';
import {isYouTubeVideoUrl} from '@shared/lib/youtube.shared';

import type {AccountId} from '@shared/types/accounts.types';
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
  FeedItemContent,
  FeedItemId,
  NewFeedItemImportState,
} from '@shared/types/feedItems.types';
import type {FeedSource} from '@shared/types/feedSources.types';
import {IconName} from '@shared/types/icons.types';
import type {Result} from '@shared/types/results.types';
import {KeyboardShortcutId} from '@shared/types/shortcuts.types';
import {SystemTagId} from '@shared/types/tags.types';
import type {
  UserFeedSubscription,
  UserFeedSubscriptionId,
} from '@shared/types/userFeedSubscriptions.types';

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

export function makeFeedItem(args: {
  feedSource: FeedSource;
  accountId: AccountId;
  content: FeedItemContent;
}): FeedItem {
  const {feedSource, accountId, content} = args;

  return {
    feedItemContentType: content.feedItemContentType,
    feedItemId: makeFeedItemId(),
    content,
    feedSource,
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

/**
 * Returns the best guess {@link FeedItemContentType} for a given URL based on a set of rules and
 * heuristics.
 */
function getFeedItemContentTypeFromUrl(
  url: string
): Exclude<FeedItemContentType, FeedItemContentType.Interval> {
  const parsedUrlResult = syncTry(() => new URL(url));
  if (!parsedUrlResult.success) {
    // Parsing the URL may throw. If it does, log the error and use a default value.
    const betterError = prefixErrorResult(parsedUrlResult, 'Error parsing feed item type from URL');
    logger.error(betterError.error, {url});
    return DEFAULT_FEED_ITEM_CONTENT_TYPE;
  }

  const parsedUrl = parsedUrlResult.value;

  // Check for exact matches against allowed hostnames.
  const hostname = parsedUrl.hostname.toLowerCase();
  const twitterHosts = ['twitter.com', 'www.twitter.com', 'x.com', 'www.x.com'];
  if (isYouTubeVideoUrl(parsedUrl.href)) {
    return FeedItemContentType.YouTube;
  } else if (isXkcdComicUrl(parsedUrl.href)) {
    return FeedItemContentType.Xkcd;
  } else if (twitterHosts.includes(hostname)) {
    return FeedItemContentType.Tweet;
  }

  // Fallback.
  return DEFAULT_FEED_ITEM_CONTENT_TYPE;
}

/**
 * Creates a new local {@link FeedItemContent} object given a URL and other metadata.
 */
export function makeFeedItemContentFromUrl(args: {
  readonly url: string;
  readonly title: string;
  readonly description: string | null;
  readonly outgoingLinks: string[];
  readonly summary: string | null;
}): Exclude<FeedItemContent, FeedItemContentType.Interval> {
  const {url, title, description, outgoingLinks, summary} = args;

  const feedItemContentType = getFeedItemContentTypeFromUrl(url);

  switch (feedItemContentType) {
    case FeedItemContentType.Article:
    case FeedItemContentType.Video:
    case FeedItemContentType.Website:
    case FeedItemContentType.Tweet:
    case FeedItemContentType.YouTube:
      return {feedItemContentType, url, title, description, outgoingLinks, summary};
    case FeedItemContentType.Xkcd:
      return {
        feedItemContentType,
        url,
        title,
        summary,
        // Remaining fields will be filled in by import.
        altText: '',
        imageUrlSmall: '',
        imageUrlLarge: '',
      };
    default:
      assertNever(feedItemContentType);
  }
}

export function makeNewFeedItemImportState(): NewFeedItemImportState {
  return {
    status: FeedItemImportStatus.New,
    shouldFetch: true,
    lastImportRequestedTime: new Date(),
    lastSuccessfulImportTime: null,
  };
}
