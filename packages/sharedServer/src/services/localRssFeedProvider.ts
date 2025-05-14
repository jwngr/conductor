import {requestPost} from '@shared/lib/requests.shared';

import type {AsyncResult} from '@shared/types/results.types';
import type {RssFeedProvider} from '@shared/types/rss.types';

interface LocalRssFeedProviderArgs {
  /** The port to run the local RSS server on. */
  readonly port: number;
  /** The URL to POST to when subscribed feeds have new items. */
  readonly callbackUrl: string;
}

export class LocalRssFeedProvider implements RssFeedProvider {
  private readonly port: number;
  private readonly callbackUrl: string;

  constructor(args: LocalRssFeedProviderArgs) {
    this.port = args.port;
    this.callbackUrl = args.callbackUrl;
  }

  private getBaseUrl(): string {
    return `http://localhost:${this.port}`;
  }

  public async subscribeToUrl(feedUrl: string): AsyncResult<void> {
    return await requestPost<undefined>(`${this.getBaseUrl()}/subscribe`, {
      feedUrl,
      callbackUrl: this.callbackUrl,
    });
  }

  public async unsubscribeFromUrl(feedUrl: string): AsyncResult<void> {
    return await requestPost<undefined>(`${this.getBaseUrl()}/unsubscribe`, {
      feedUrl,
    });
  }
}
