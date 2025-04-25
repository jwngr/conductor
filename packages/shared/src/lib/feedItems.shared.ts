import {logger} from '@shared/services/logger.shared';

import {prefixError, upgradeUnknownError} from '@shared/lib/errorUtils.shared';
import {makeErrorResult, makeSuccessResult} from '@shared/lib/results.shared';

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
    args: Pick<FeedItem, 'type' | 'accountId' | 'url' | 'feedItemSource' | 'title'>
  ): Result<FeedItem> {
    return makeSuccessResult<FeedItem>({
      feedItemId: makeFeedItemId(),
      accountId: args.accountId,
      url: args.url,
      type: args.type,
      feedItemSource: args.feedItemSource,
      importState: makeNewFeedItemImportState(),
      // TODO: Update these and figure out a better solution. Maybe a better discriminated union.
      title: args.title,
      description: 'Test description from makeFeedItem',
      summary: 'Test summary from makeFeedItem',
      outgoingLinks: [],
      triageStatus: TriageStatus.Untriaged,
      tagIds: {
        [SystemTagId.Unread]: true,
      },
      // TODO(timestamps): Use server timestamps instead.
      createdTime: new Date(),
      lastUpdatedTime: new Date(),
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

  public static getRetryImportFeedItemActionInfo(): FeedItemAction {
    return {
      type: FeedItemActionType.RetryImport,
      text: 'Retry import',
      icon: IconName.RetryImport,
    };
  }

  public static getDebugSaveExampleFeedItemActionInfo(): FeedItemAction {
    return {
      type: FeedItemActionType.DebugSaveExample,
      text: 'Save example',
      icon: IconName.DebugSaveExample,
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
}
