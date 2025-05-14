import {prefixErrorResult} from '@shared/lib/errorUtils.shared';
import {requestPost} from '@shared/lib/requests.shared';
import {makeSuccessResult} from '@shared/lib/results.shared';

import type {AsyncResult} from '@shared/types/results.types';
import type {RssFeedItem, RssFeedProvider} from '@shared/types/rssFeedProvider.types';

const SUPERFEEDR_BASE_URL = 'https://push.superfeedr.com/';

export class SuperfeedrService implements RssFeedProvider {
  private readonly superfeedrUser: string;
  private readonly superfeedrApiKey: string;
  private readonly webhookBaseUrl: string;
  private readonly callbacks: Map<string, (newItems: RssFeedItem[]) => Promise<void>>;

  constructor(args: {
    readonly superfeedrUser: string;
    readonly superfeedrApiKey: string;
    readonly webhookBaseUrl: string;
  }) {
    this.superfeedrUser = args.superfeedrUser;
    this.superfeedrApiKey = args.superfeedrApiKey;
    this.webhookBaseUrl = args.webhookBaseUrl;
    this.callbacks = new Map();
  }

  private getSuperfeedrAuthHeader(): string {
    return `Basic ${Buffer.from(`${this.superfeedrUser}:${this.superfeedrApiKey}`).toString('base64')}`;
  }

  private getSuperfeedrWebhookUrl(): string {
    // This path needs to match the Firebase Function name.
    return `${this.webhookBaseUrl}/handleSuperfeedrWebhook`;
  }

  public async subscribeToUrl(
    feedUrl: string,
    callback: (newItems: RssFeedItem[]) => Promise<void>
  ): AsyncResult<void> {
    // Store callback for later use
    this.callbacks.set(feedUrl, callback);

    // Subscribe to the feed on Superfeedr
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
    // Remove callback
    this.callbacks.delete(feedUrl);

    // Unsubscribe from the feed on Superfeedr
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
