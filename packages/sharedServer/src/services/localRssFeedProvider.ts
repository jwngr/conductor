import {requestPost} from '@shared/lib/requests.shared';
import {makeErrorResult, makeSuccessResult} from '@shared/lib/results.shared';
import {isValidUrl} from '@shared/lib/urls.shared';
import {isValidPort} from '@shared/lib/utils.shared';

import type {AsyncResult} from '@shared/types/results.types';
import type {RssFeedProvider} from '@shared/types/rss.types';
import {RssFeedProviderType} from '@shared/types/rss.types';

interface LocalRssFeedProviderArgs {
  /** The port to run the local RSS server on. */
  readonly port: number;
  /** The URL the feed provider should POST to when a subscribed feed has new items. */
  readonly callbackUrl: string;
  /** The secret used to validate webhook requests. */
  readonly webhookSecret: string;
}

export class LocalRssFeedProvider implements RssFeedProvider {
  private readonly port: number;
  private readonly callbackUrl: string;
  // TODO: Actually check this for incoming webhook requests.
  public readonly webhookSecret: string;

  constructor(args: LocalRssFeedProviderArgs) {
    this.port = args.port;
    if (!isValidPort(this.port)) {
      // eslint-disable-next-line no-restricted-syntax
      throw new Error('Invalid port number');
    }

    this.callbackUrl = args.callbackUrl;
    if (!isValidUrl(this.callbackUrl)) {
      // eslint-disable-next-line no-restricted-syntax
      throw new Error('Invalid callback URL');
    }

    this.webhookSecret = args.webhookSecret;
  }

  public readonly type = RssFeedProviderType.Local;

  private getApiBaseUrl(): string {
    return `http://localhost:${this.port}`;
  }

  public async subscribeToUrl(feedUrl: string): AsyncResult<void, Error> {
    const result = await requestPost<undefined>(`${this.getApiBaseUrl()}/subscribe`, {
      feedUrl,
      callbackUrl: this.callbackUrl,
    });
    if (!result.success) {
      if (result.error.message.toLowerCase().includes('fetch failed')) {
        return makeErrorResult(
          new Error('Could not connect to local RSS server. Make sure it is running.')
        );
      }
      return result;
    }
    return makeSuccessResult(result.value);
  }

  public async unsubscribeFromUrl(feedUrl: string): AsyncResult<void, Error> {
    return await requestPost<undefined>(`${this.getApiBaseUrl()}/unsubscribe`, {feedUrl});
  }
}
