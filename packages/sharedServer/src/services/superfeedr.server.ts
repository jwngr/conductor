import {logger} from '@shared/services/logger.shared';

import {asyncTry, prefixError, prefixErrorResult} from '@shared/lib/errorUtils.shared';
import {requestGet, requestPost} from '@shared/lib/requests.shared';
import {makeSuccessResult} from '@shared/lib/results.shared';

import type {AsyncResult} from '@shared/types/results.types';
import type {RssFeed, RssFeedItem, RssFeedProvider} from '@shared/types/rssFeedProvider.types';

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

  public async subscribe(
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

  public async unsubscribe(feedUrl: string): AsyncResult<void> {
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

  public async getFeed(feedUrl: string): AsyncResult<RssFeed> {
    // Fetch the feed from Superfeedr
    const result = await requestGet<{
      status: {
        feed: string;
        http: string;
        code: number;
      };
      title: string;
      description?: string;
      items: Array<{
        id: string;
        title: string;
        description?: string;
        link: string;
        published: string;
        content?: string;
      }>;
    }>(`${SUPERFEEDR_BASE_URL}?hub.topic=${encodeURIComponent(feedUrl)}&format=json`, {
      headers: {
        Authorization: this.getSuperfeedrAuthHeader(),
      },
    });

    if (!result.success) {
      return prefixErrorResult(result, 'Failed to get feed');
    }

    // Convert Superfeedr response to our RssFeed format
    return makeSuccessResult({
      metadata: {
        title: result.value.title,
        description: result.value.description,
        link: result.value.status.feed,
      },
      items: result.value.items.map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        link: item.link,
        pubDate: new Date(item.published),
        content: item.content,
      })),
    });
  }

  // This method would be called by the webhook handler when Superfeedr sends updates
  public async handleWebhook(feedUrl: string, items: RssFeedItem[]): Promise<void> {
    const callback = this.callbacks.get(feedUrl);
    if (callback) {
      const result = await asyncTry(async () => {
        await callback(items);
      });
      if (!result.success) {
        logger.error(prefixError(result.error, 'Error handling Superfeedr webhook callback'), {
          feedUrl,
        });
      }
    }
  }
}
