import {prefixErrorResult, prefixResultIfError} from '@shared/lib/errorUtils.shared';

import {AccountId} from '@shared/types/accounts.types';
import {AsyncResult} from '@shared/types/result.types';
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
}
