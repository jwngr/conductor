import {requestPost} from '@shared/lib/requests.shared';
import {makeErrorResult, makeSuccessResult} from '@shared/lib/results.shared';

import type {AsyncResult} from '@shared/types/results.types';
import type {RssFeedProvider} from '@shared/types/rss.types';

interface LocalRssFeedProviderArgs {
  /** The port to run the local RSS server on. */
  readonly port: number;
  /** The URL the feed provider should POST to when a subscribed feed has new items. */
  readonly callbackUrl: string;
}

export class LocalRssFeedProvider implements RssFeedProvider {
  private readonly port: number;
  private readonly callbackUrl: string;

  constructor(args: LocalRssFeedProviderArgs) {
    this.port = args.port;
    this.callbackUrl = args.callbackUrl;
  }

  private getApiBaseUrl(): string {
    return `http://localhost:${this.port}`;
  }

  public async subscribeToUrl(feedUrl: string): AsyncResult<void> {
    const result = await requestPost<undefined>(`${this.getApiBaseUrl()}/subscribe`, {
      feedUrl,
      callbackUrl: this.callbackUrl,
    });
    if (!result.success) {
      if (result.error.message.includes('fetch failed')) {
        return makeErrorResult(
          new Error('Could not connect to local RSS server. Make sure it is running.')
        );
      }
      return result;
    }
    return makeSuccessResult(result.value);
  }

  public async unsubscribeFromUrl(feedUrl: string): AsyncResult<void> {
    return await requestPost<undefined>(`${this.getApiBaseUrl()}/unsubscribe`, {feedUrl});
  }
}
