import {httpsCallable, HttpsCallableResult} from 'firebase/functions';

import {functions} from '@shared/lib/firebase';

import {AsyncFunc} from '@shared/types/utils.types';

interface SubscribeToFeedRequest {
  readonly url: string;
}

interface SubscribeToFeedResponse {
  readonly feedSubscriptionId: string;
}

const callSubscribeToFeed: AsyncFunc<
  SubscribeToFeedRequest,
  HttpsCallableResult<SubscribeToFeedResponse>
> = httpsCallable(functions, 'subscribeToFeedOnCall');

export async function subscribeToFeed(feedUrl: string): Promise<void> {
  await callSubscribeToFeed({url: feedUrl});
}
