import {prefixErrorResult} from '@shared/lib/errorUtils.shared';
import {requestPost} from '@shared/lib/requests.shared';
import {makeSuccessResult} from '@shared/lib/results.shared';

import type {AsyncResult} from '@shared/types/results.types';
import type {RssFeedProvider} from '@shared/types/rss.types';

const SUPERFEEDR_BASE_URL = 'https://push.superfeedr.com/';

export class SuperfeedrService implements RssFeedProvider {
  private readonly superfeedrUser: string;
  private readonly superfeedrApiKey: string;
  private readonly callbackUrl: string;

  constructor(args: {
    readonly superfeedrUser: string;
    readonly superfeedrApiKey: string;
    readonly callbackUrl: string;
  }) {
    this.superfeedrUser = args.superfeedrUser;
    this.superfeedrApiKey = args.superfeedrApiKey;
    this.callbackUrl = args.callbackUrl;
  }

  private getSuperfeedrAuthHeader(): string {
    return `Basic ${Buffer.from(`${this.superfeedrUser}:${this.superfeedrApiKey}`).toString('base64')}`;
  }

  private getSuperfeedrWebhookUrl(): string {
    // This path needs to match the Firebase Function name.
    return `${this.callbackUrl}/handleSuperfeedrWebhook`;
  }

  public async subscribeToUrl(feedUrl: string): AsyncResult<void> {
    const result = await requestPost<string>(
      SUPERFEEDR_BASE_URL,
      {
        'hub.mode': 'subscribe',
        'hub.topic': feedUrl,
        'hub.callback': this.getSuperfeedrWebhookUrl(),
        format: 'json',
      },
      {
        headers: {
          Authorization: this.getSuperfeedrAuthHeader(),
        },
      }
    );

    if (!result.success) {
      return prefixErrorResult(result, 'Failed to subscribe to feed');
    }

    return makeSuccessResult(undefined);
  }

  public async unsubscribeFromUrl(feedUrl: string): AsyncResult<void> {
    const result = await requestPost<undefined>(SUPERFEEDR_BASE_URL, {
      headers: {
        Authorization: this.getSuperfeedrAuthHeader(),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'hub.mode': 'unsubscribe',
        'hub.topic': feedUrl,
        'hub.callback': this.getSuperfeedrWebhookUrl(),
        format: 'json',
      }),
    });

    if (!result.success) {
      return prefixErrorResult(result, 'Failed to unsubscribe from feed');
    }

    return makeSuccessResult(undefined);
  }
}
