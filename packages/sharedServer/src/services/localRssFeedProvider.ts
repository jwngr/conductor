import {logger} from '@shared/services/logger.shared';

import {asyncTry, prefixError, prefixResultIfError} from '@shared/lib/errorUtils.shared';
import {requestGet, requestPost} from '@shared/lib/requests.shared';
import {makeErrorResult, makeSuccessResult} from '@shared/lib/results.shared';

import type {AsyncResult} from '@shared/types/results.types';
import type {RssFeed, RssFeedProvider} from '@shared/types/rssFeedProvider.types';

const LOCAL_RSS_SERVER_PORT = 6556;
const LOCAL_RSS_SERVER_URL = `http://localhost:${LOCAL_RSS_SERVER_PORT}`;

interface LocalRssFeedProviderArgs {
  /** The URL to POST to when subscribed feeds have new items. */
  readonly callbackBaseUrl: string;
}

export class LocalRssFeedProvider implements RssFeedProvider {
  private readonly callbackBaseUrl: string;

  constructor(args: LocalRssFeedProviderArgs) {
    this.callbackBaseUrl = args.callbackBaseUrl;
  }

  public async subscribeToUrl(feedUrl: string): AsyncResult<void> {
    const result = await requestPost<undefined>(`${LOCAL_RSS_SERVER_URL}/subscribe`, {
      feedUrl,
      callbackBaseUrl: this.callbackBaseUrl,
    });

    return prefixResultIfError(result, 'Failed to subscribe to feed');
  }

  public async unsubscribeFromUrl(feedUrl: string): AsyncResult<void> {
    const result = await requestPost<undefined>(`${LOCAL_RSS_SERVER_URL}/unsubscribe`, {
      feedUrl,
    });

    return prefixResultIfError(result, 'Failed to unsubscribe from feed');
  }
}
