import {prefixError} from '@shared/lib/errorUtils.shared';

import {AsyncResult, makeErrorResult} from '@shared/types/result.types';
import {UserId} from '@shared/types/user.types';
import {UserFeedSubscription} from '@shared/types/userFeedSubscriptions.types';

import {ServerFeedSourcesService} from './feedSources.server';
import {SuperfeedrService} from './superfeedr.server';
import {ServerUserFeedSubscriptionsService} from './userFeedSubscriptions.server';

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

  async subscribeUserToUrl(args: {
    readonly url: string;
    readonly userId: UserId;
  }): AsyncResult<UserFeedSubscription> {
    const {url, userId} = args;

    // Check if the feed source already exists. A single feed source can have multiple users
    // subscribed to it, but we only want to subscribe once to it in Superfeedr. Feed sources are
    // deduped based on exact URL match, although we could probably be smarter in the future.
    const fetchFeedSourceByUrlResult = await this.feedSourcesService.fetchByUrl(url);
    if (!fetchFeedSourceByUrlResult.success) {
      return makeErrorResult(
        prefixError(fetchFeedSourceByUrlResult.error, 'Error fetching existing feed source by URL')
      );
    }

    let feedSource = fetchFeedSourceByUrlResult.value;

    // If the feed source does not already exist, create it in and subscribe to it in Superfeedr.
    if (!feedSource) {
      // TODO: Enrich the feed with a title and image.
      const addFeedSourceResult = await this.feedSourcesService.add({url, title: ''});
      if (!addFeedSourceResult.success) {
        return makeErrorResult(
          prefixError(addFeedSourceResult.error, 'Error creating new feed source')
        );
      }

      feedSource = addFeedSourceResult.value;

      const subscribeToSuperfeedrResult = await this.superfeedrService.subscribeToUrl(
        feedSource.url
      );
      if (!subscribeToSuperfeedrResult.success) {
        return makeErrorResult(
          prefixError(subscribeToSuperfeedrResult.error, 'Error subscribing to Superfeedr feed')
        );
      }
    }

    const createSubscriptionResult = await this.userFeedSubscriptionsService.add({
      feedSource,
      userId,
    });
    if (!createSubscriptionResult.success) {
      return makeErrorResult(
        prefixError(createSubscriptionResult.error, 'Error creating user feed subscription')
      );
    }

    return createSubscriptionResult;
  }
}
