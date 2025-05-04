import {logger} from '@shared/services/logger.shared';

import {prefixError, upgradeUnknownError} from '@shared/lib/errorUtils.shared';
import {makeErrorResult, makeSuccessResult} from '@shared/lib/results.shared';
import {assertNever} from '@shared/lib/utils.shared';

import type {DeliverySchedule} from '@shared/types/deliverySchedules.types';
import {
  FeedItemActionType,
  FeedItemType,
  makeFeedItemId,
  makeNewFeedItemImportState,
  TriageStatus,
} from '@shared/types/feedItems.types';
import type {FeedItem, FeedItemAction} from '@shared/types/feedItems.types';
import {IconName} from '@shared/types/icons.types';
import type {Result} from '@shared/types/results.types';
import {KeyboardShortcutId} from '@shared/types/shortcuts.types';
import {SystemTagId} from '@shared/types/tags.types';
import type {TagId} from '@shared/types/tags.types';
import type {UserFeedSubscriptionId} from '@shared/types/userFeedSubscriptions.types';

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

  public static isUnread(feedItem: MaybeFeedItem): boolean {
    return feedItem?.tagIds[SystemTagId.Unread] === true;
  }

  public static makeFeedItem(
    args: Pick<FeedItem, 'accountId' | 'url' | 'feedItemSource' | 'title' | 'description'>
  ): Result<FeedItem> {
    const {accountId, url, feedItemSource, title, description} = args;

    // Common fields across all feed item types.
    const feedItemId = makeFeedItemId();
    const feedItemType = SharedFeedItemHelpers.getFeedItemTypeFromUrl(url);
    const triageStatus = TriageStatus.Untriaged;
    const importState = makeNewFeedItemImportState();
    const tagIds: Partial<Record<TagId, true>> = {
      [SystemTagId.Unread]: true,
    };
    const summary = null;
    const outgoingLinks: string[] = [];

    // Some feed item contain additional fields.
    switch (feedItemType) {
      case FeedItemType.Article:
      case FeedItemType.Video:
      case FeedItemType.Tweet:
      case FeedItemType.Website:
      case FeedItemType.YouTube:
        return makeSuccessResult<FeedItem>({
          type: feedItemType,
          url,
          accountId,
          feedItemId,
          feedItemSource,
          importState,
          title,
          description,
          summary,
          outgoingLinks,
          triageStatus,
          tagIds,
          // TODO(timestamps): Use server timestamps instead.
          createdTime: new Date(),
          lastUpdatedTime: new Date(),
        });
      case FeedItemType.Xkcd:
        return makeSuccessResult<FeedItem>({
          type: FeedItemType.Xkcd,
          xkcd: null,
          url,
          accountId,
          feedItemId,
          feedItemSource,
          importState,
          title,
          description,
          summary,
          outgoingLinks,
          triageStatus,
          tagIds,
          // TODO(timestamps): Use server timestamps instead.
          createdTime: new Date(),
          lastUpdatedTime: new Date(),
        });
      default:
        assertNever(feedItemType);
    }
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

  public static getRetryImportFeedItemActionInfo(): FeedItemAction {
    return {
      type: FeedItemActionType.RetryImport,
      text: 'Retry import',
      icon: IconName.RetryImport,
    };
  }

  public static getCancelFeedItemActionInfo(): FeedItemAction {
    return {
      type: FeedItemActionType.Cancel,
      text: 'Cancel',
      icon: IconName.Cancel,
    };
  }

  public static validateUrl(url: string): Result<void> {
    // Parse the URL to validate its structure.
    const parsedUrl = new URL(url);

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

  public static getFeedItemTypeFromUrl(url: string): FeedItemType {
    // Parsing the URL may throw. If it does, ignore the error and just use a default value.
    let parsedUrl: URL;
    // eslint-disable-next-line no-restricted-syntax
    try {
      parsedUrl = new URL(url);
    } catch (error) {
      const betterError = upgradeUnknownError(error);
      logger.error(prefixError(betterError, 'Error parsing feed item type from URL'), {error, url});
      return FeedItemType.Website;
    }

    const hostname = parsedUrl.hostname.toLowerCase();

    // Check for exact matches against allowed hostnames.
    const youtubeHosts = ['youtube.com', 'www.youtube.com', 'youtu.be', 'www.youtu.be'];
    const xkcdHosts = ['xkcd.com', 'www.xkcd.com'];
    const twitterHosts = ['twitter.com', 'www.twitter.com', 'x.com', 'www.x.com'];
    if (youtubeHosts.includes(hostname)) {
      return FeedItemType.YouTube;
    } else if (xkcdHosts.includes(hostname)) {
      return FeedItemType.Xkcd;
    } else if (twitterHosts.includes(hostname)) {
      return FeedItemType.Tweet;
    }

    return FeedItemType.Website;
  }

  public static hasEverBeenImported(feedItem: FeedItem): boolean {
    return feedItem.importState.lastSuccessfulImportTime !== null;
  }
}

export function findDeliveryScheduleForFeedSubscription(args: {
  readonly feedSubscriptionId: UserFeedSubscriptionId;
  readonly deliverySchedules: DeliverySchedule[];
}): DeliverySchedule | null {
  const {feedSubscriptionId, deliverySchedules} = args;
  const matchingDeliverySchedule = deliverySchedules.find(
    (deliverySchedule) => deliverySchedule.userFeedSubscriptionId === feedSubscriptionId
  );

  return matchingDeliverySchedule ?? null;
}
