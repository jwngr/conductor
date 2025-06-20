import {logger} from '@shared/services/logger.shared';

import {prefixErrorResult} from '@shared/lib/errorUtils.shared';
import {makeSuccessResult} from '@shared/lib/results.shared';

import type {AsyncResult} from '@shared/types/results.types';
import type {RssFeedProvider} from '@shared/types/rss.types';

import type {ServerFeedSubscriptionsService} from '@sharedServer/services/feedSubscriptions.server';

import {parseRssFeed} from '@sharedServer/lib/rss.server';

export class ServerRssFeedService {
  private readonly rssFeedProvider: RssFeedProvider;
  private readonly feedSubscriptionsService: ServerFeedSubscriptionsService;

  constructor(args: {
    readonly rssFeedProvider: RssFeedProvider;
    readonly feedSubscriptionsService: ServerFeedSubscriptionsService;
  }) {
    this.rssFeedProvider = args.rssFeedProvider;
    this.feedSubscriptionsService = args.feedSubscriptionsService;
  }

  async subscribeToUrl(url: string): AsyncResult<void, Error> {
    // Fetch and parse the RSS feed.
    const rssFeedResult = await parseRssFeed(url);
    if (!rssFeedResult.success) return prefixErrorResult(rssFeedResult, 'Error parsing RSS feed');

    // Subscribe to the feed source in the feed provider.
    const subscribeResult = await this.rssFeedProvider.subscribeToUrl(url);
    if (!subscribeResult.success) return subscribeResult;

    return makeSuccessResult(subscribeResult.value);
  }

  /**
   * Unsubscribes from an RSS feed by URL in the feed provider.
   */
  async unsubscribeFromUrl(url: string): AsyncResult<void, Error> {
    // Fetch all active subscriptions for the feed source.
    const fetchSubsResult = await this.feedSubscriptionsService.fetchForRssFeedByUrl(url);
    if (!fetchSubsResult.success) {
      const message =
        '[UNSUBSCRIBE] Error fetching other subscriptions while unsubscribing from feed';
      return prefixErrorResult(fetchSubsResult, message);
    }

    // If other active subscriptions exist, don't actually unsubscribe from the feed provider.
    const activeSubscriptions = fetchSubsResult.value.filter((sub) => sub.isActive);
    if (activeSubscriptions.length > 0) return makeSuccessResult(undefined);

    logger.log('[UNSUBSCRIBE] No active subscriptions found, unsubscribing from feed', {
      url,
    });

    // Unsubscribe from the feed provider.
    return await this.rssFeedProvider.unsubscribeFromUrl(url);
  }
}
