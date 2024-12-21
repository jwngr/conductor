import {CollectionReference} from 'firebase/firestore';
import {Functions, httpsCallable, HttpsCallableResult} from 'firebase/functions';

import {asyncTry} from '@shared/lib/errors';

import {AsyncResult, makeSuccessResult} from '@shared/types/result.types';
import {
  makeUserFeedSubscriptionId,
  UserFeedSubscriptionId,
} from '@shared/types/userFeedSubscriptions.types';
import {AsyncFunc} from '@shared/types/utils.types';

interface SubscribeToFeedRequest {
  readonly url: string;
}

interface SubscribeToFeedResponse {
  readonly feedSubscriptionId: string;
}

type CallSubscribeUserToFeedFn = AsyncFunc<
  SubscribeToFeedRequest,
  HttpsCallableResult<SubscribeToFeedResponse>
>;

export class ClientUserFeedSubscriptionsService {
  private functions: Functions;
  private userFeedSubscriptionsDbRef: CollectionReference;

  constructor(args: {
    readonly functions: Functions;
    readonly userFeedSubscriptionsDbRef: CollectionReference;
  }) {
    const {functions, userFeedSubscriptionsDbRef} = args;
    this.functions = functions;
    this.userFeedSubscriptionsDbRef = userFeedSubscriptionsDbRef;
  }

  /**
   * Subscribes to a feed. If the feed does not already exist in the feeds collection, it will be
   * created.
   */
  public async subscribeToFeedUrl(url: string): AsyncResult<UserFeedSubscriptionId> {
    const callSubscribeUserToFeed: CallSubscribeUserToFeedFn = httpsCallable(
      this.functions,
      'subscribeUserToFeedOnCall'
    );

    // Hit Firebase Functions endpoint to subscribe user to feed.
    const subscribeResponseResult = await asyncTry(
      async () => await callSubscribeUserToFeed({url})
    );
    if (!subscribeResponseResult.success) return subscribeResponseResult;
    const subscribeResponse = subscribeResponseResult.value;

    // Parse the response to get the new user feed subscription ID.
    const newUserFeedSubscriptionIdResult = makeUserFeedSubscriptionId(
      subscribeResponse.data.feedSubscriptionId
    );
    if (!newUserFeedSubscriptionIdResult.success) return newUserFeedSubscriptionIdResult;
    const newUserFeedSubscriptionId = newUserFeedSubscriptionIdResult.value;

    return makeSuccessResult(newUserFeedSubscriptionId);
  }

  /**
   * Watches a feed for updates.
  //  */
  // public watchFeed(feedId: FeedId, onFeedUpdate: Supplier<Feed>): Result<Unsubscribe> {
  //   const unsubscribe = this.functions.watchFeed(feedId, onFeedUpdate);
  //   return makeSuccessResult(unsubscribe);
  // }
}
