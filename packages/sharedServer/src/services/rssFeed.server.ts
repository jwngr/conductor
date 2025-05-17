import {logger} from '@shared/services/logger.shared';

import {prefixErrorResult, prefixResultIfError} from '@shared/lib/errorUtils.shared';
import {makeSuccessResult} from '@shared/lib/results.shared';

import type {AccountId} from '@shared/types/accounts.types';
import type {FeedSourceId} from '@shared/types/feedSources.types';
import type {AsyncResult} from '@shared/types/results.types';
import type {RssFeedProvider} from '@shared/types/rss.types';
import type {UserFeedSubscription} from '@shared/types/userFeedSubscriptions.types';

import type {ServerFeedSourcesService} from '@sharedServer/services/feedSources.server';
import type {ServerUserFeedSubscriptionsService} from '@sharedServer/services/userFeedSubscriptions.server';

import {parseRssFeed} from '@sharedServer/lib/rss.server';

const DEFAULT_FEED_TITLE = '(no title)';

export class ServerRssFeedService {
  private readonly rssFeedProvider: RssFeedProvider;
  private readonly feedSourcesService: ServerFeedSourcesService;
  private readonly userFeedSubscriptionsService: ServerUserFeedSubscriptionsService;

  constructor(args: {
    readonly rssFeedProvider: RssFeedProvider;
    readonly feedSourcesService: ServerFeedSourcesService;
    readonly userFeedSubscriptionsService: ServerUserFeedSubscriptionsService;
  }) {
    this.rssFeedProvider = args.rssFeedProvider;
    this.feedSourcesService = args.feedSourcesService;
    this.userFeedSubscriptionsService = args.userFeedSubscriptionsService;
  }

  async subscribeAccountToUrl(args: {
    readonly url: string;
    readonly accountId: AccountId;
  }): AsyncResult<UserFeedSubscription> {
    const {url, accountId} = args;

    // Fetch and parse the RSS feed.
    const parsedRssFeedResult = await parseRssFeed(url);
    if (!parsedRssFeedResult.success) {
      return prefixErrorResult(parsedRssFeedResult, 'Error parsing RSS feed');
    }

    const parsedRssFeed = parsedRssFeedResult.value;

    // Check if the feed source already exists. A single feed source can have multiple accounts
    // subscribed to it, but we only want to subscribe once to it in the feed provider. Feed
    // sources are deduped based on exact URL match, although we could be smarter in the future.
    const fetchFeedSourceResult = await this.feedSourcesService.fetchByUrlOrCreate(url, {
      // TODO: Consider just storing `null` for the title if it's not available.
      title: parsedRssFeed.title ?? DEFAULT_FEED_TITLE,
    });
    if (!fetchFeedSourceResult.success) {
      return prefixErrorResult(
        fetchFeedSourceResult,
        'Error fetching or creating feed source by URL'
      );
    }

    const feedSource = fetchFeedSourceResult.value;

    // Subscribe to the feed source in the feed provider.
    const subscribeResult = await this.rssFeedProvider.subscribeToUrl(feedSource.url);
    if (!subscribeResult.success) return subscribeResult;

    // Create a user feed subscription in the database.
    const saveToDbResult = await this.userFeedSubscriptionsService.create({feedSource, accountId});
    return prefixResultIfError(saveToDbResult, 'Error creating user feed subscription');
  }

  /**
   * Unsubscribes from a feed URL in the feed provider.
   */
  async unsubscribeAccountFromUrl(args: {
    readonly feedSourceId: FeedSourceId;
    readonly url: string;
    readonly accountId: AccountId;
  }): AsyncResult<void> {
    const {url, accountId, feedSourceId} = args;

    const otherSubscriptionsResult =
      await this.userFeedSubscriptionsService.fetchForFeedSource(feedSourceId);

    if (!otherSubscriptionsResult.success) {
      return prefixErrorResult(
        otherSubscriptionsResult,
        '[UNSUBSCRIBE] Error fetching other subscriptions while unsubscribing account from feed'
      );
    }

    // If other active subscriptions exist, don't actually unsubscribe from the feed provider.
    const activeSubscriptions = otherSubscriptionsResult.value.filter((sub) => sub.isActive);
    if (activeSubscriptions.length > 0) {
      return makeSuccessResult(undefined);
    }

    logger.log('[UNSUBSCRIBE] No active subscriptions found, unsubscribing account from feed', {
      feedSourceId,
      accountId,
      url,
    });

    return await this.rssFeedProvider.unsubscribeFromUrl(url);
  }
}
