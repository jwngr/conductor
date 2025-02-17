import {logger} from '@shared/services/logger.shared';

import {prefixErrorResult, prefixResultIfError} from '@shared/lib/errorUtils.shared';

import {AccountId} from '@shared/types/accounts.types';
import {FeedSourceId} from '@shared/types/feedSources.types';
import {AsyncResult, makeSuccessResult} from '@shared/types/result.types';
import {UserFeedSubscription} from '@shared/types/userFeedSubscriptions.types';

import {ServerFeedSourcesService} from '@sharedServer/services/feedSources.server';
import {SuperfeedrService} from '@sharedServer/services/superfeedr.server';
import {ServerUserFeedSubscriptionsService} from '@sharedServer/services/userFeedSubscriptions.server';

export class ServerRssFeedService {
  private readonly superfeedrService: SuperfeedrService;
  private readonly feedSourcesService: ServerFeedSourcesService;
  private readonly userFeedSubscriptionsService: ServerUserFeedSubscriptionsService;

  constructor(args: {
    readonly superfeedrService: SuperfeedrService;
    readonly feedSourcesService: ServerFeedSourcesService;
    readonly userFeedSubscriptionsService: ServerUserFeedSubscriptionsService;
  }) {
    this.superfeedrService = args.superfeedrService;
    this.feedSourcesService = args.feedSourcesService;
    this.userFeedSubscriptionsService = args.userFeedSubscriptionsService;
  }

  async subscribeAccountToUrl(args: {
    readonly url: string;
    readonly accountId: AccountId;
  }): AsyncResult<UserFeedSubscription> {
    const {url, accountId} = args;

    // Check if the feed source already exists. A single feed source can have multiple accounts
    // subscribed to it, but we only want to subscribe once to it in Superfeedr. Feed sources are
    // deduped based on exact URL match, although we could probably be smarter in the future.
    const fetchFeedSourceResult = await this.feedSourcesService.fetchByUrlOrCreate(url, {
      // TODO: Enrich the feed sourcewith a title and image.
      title: 'Test title from subscribeAccountToUrl',
    });
    if (!fetchFeedSourceResult.success) {
      return prefixErrorResult(
        fetchFeedSourceResult,
        'Error fetching or creating feed source by URL'
      );
    }

    const feedSource = fetchFeedSourceResult.value;

    // Subscribe to the feed source in Superfeedr.
    const subscribeToSuperfeedrResult = await this.superfeedrService.subscribeToUrl(feedSource.url);
    if (!subscribeToSuperfeedrResult.success) {
      return prefixErrorResult(subscribeToSuperfeedrResult, 'Error subscribing to Superfeedr feed');
    }

    // Create a user feed subscription in the database.
    const saveToDbResult = await this.userFeedSubscriptionsService.create({feedSource, accountId});
    return prefixResultIfError(saveToDbResult, 'Error creating user feed subscription');
  }

  /**
   * Unsubscribes from a feed URL in Superfeedr.
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
        '[UNSUBSCRIBE] Error fetching other subscriptions while unsubscribing account from Superfeedr feed'
      );
    }

    // If other active subscriptions exist, don't actually unsubscribe from Superfeedr.
    const activeSubscriptions = otherSubscriptionsResult.value.filter((sub) => sub.isActive);
    if (activeSubscriptions.length > 0) {
      return makeSuccessResult(undefined);
    }

    logger.log(
      '[UNSUBSCRIBE] No active subscriptions found, unsubscribing account from Superfeedr feed',
      {feedSourceId, accountId, url}
    );

    return await this.superfeedrService.unsubscribeFromFeed(url);
  }
}
