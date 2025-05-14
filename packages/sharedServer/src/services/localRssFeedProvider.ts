import {requestPost} from '@shared/lib/requests.shared';

import type {AsyncResult} from '@shared/types/results.types';
import type {RssFeedProvider} from '@shared/types/rss.types';

// TODO: Move to shared config.
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
    return await requestPost<undefined>(`${LOCAL_RSS_SERVER_URL}/subscribe`, {
      feedUrl,
      callbackBaseUrl: this.callbackBaseUrl,
    });
  }

  public async unsubscribeFromUrl(feedUrl: string): AsyncResult<void> {
    return await requestPost<undefined>(`${LOCAL_RSS_SERVER_URL}/unsubscribe`, {
      feedUrl,
    });
  }
}
