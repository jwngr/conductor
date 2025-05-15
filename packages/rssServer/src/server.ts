import {serve} from '@hono/node-server';
import {Hono} from 'hono';
import type {Context} from 'hono';

import {logger} from '@shared/services/logger.shared';

import {prefixError, upgradeUnknownError} from '@shared/lib/errorUtils.shared';
import {requestPost} from '@shared/lib/requests.shared';
import {makeErrorResult, makeSuccessResult} from '@shared/lib/results.shared';

import type {AsyncResult, Result} from '@shared/types/results.types';
import type {RssFeed, RssFeedItem} from '@shared/types/rss.types';

// TODO: Move this to a config file.
const RSS_SERVER_PORT = 6556;

interface Subscription {
  readonly feedUrl: string;
  readonly callbackUrl: string;
}

export class RssServer {
  private readonly app: Hono;
  private readonly feeds: Map<string, RssFeed>;
  private readonly subscriptions: Map<string, Set<Subscription>>;
  private readonly port: number;

  constructor(args: {port: number}) {
    this.app = new Hono();
    this.feeds = new Map();
    this.subscriptions = new Map();
    this.port = args.port;
    this.setupRoutes();
  }

  private setupRoutes(): void {
    // Serve RSS feeds
    this.app.get('/feed/:id', (c: Context) => {
      const feedId = c.req.param('id');
      const feed = this.feeds.get(feedId);

      if (!feed) {
        return c.text('Feed not found', 404);
      }

      const rss = this.convertToRssXml(feed);
      return c.text(rss, 200, {
        'Content-Type': 'application/xml',
      });
    });

    // Subscribe to a feed
    this.app.post('/subscribe', async (c: Context) => {
      const {feedUrl, callbackUrl} = await c.req.json();

      if (!feedUrl || !callbackUrl) {
        return c.text('Missing required parameters', 400);
      }

      const subscription: Subscription = {feedUrl, callbackUrl};

      const feedSubscriptions = this.subscriptions.get(feedUrl) ?? new Set();
      feedSubscriptions.add(subscription);
      this.subscriptions.set(feedUrl, feedSubscriptions);

      return c.text('OK', 200);
    });

    // Unsubscribe from a feed
    this.app.post('/unsubscribe', async (c: Context) => {
      const {feedUrl} = await c.req.json();

      if (!feedUrl) {
        return c.text('Missing required parameters', 400);
      }

      const feedSubscriptions = this.subscriptions.get(feedUrl);
      if (feedSubscriptions) {
        feedSubscriptions.clear();
        if (feedSubscriptions.size === 0) {
          this.subscriptions.delete(feedUrl);
        }
      }

      return c.text('OK', 200);
    });
  }

  public async start(): AsyncResult<void> {
    return new Promise((resolve) => {
      serve(
        {
          // eslint-disable-next-line no-restricted-syntax
          fetch: this.app.fetch,
          port: this.port,
        },
        (info: {port: number}) => {
          logger.log(`RSS server running on port ${info.port}`);
          resolve(makeSuccessResult(undefined));
        }
      );
    });
  }

  public addFeed(feed: RssFeed): Result<void> {
    this.feeds.set(feed.id, feed);
    return makeSuccessResult(undefined);
  }

  public async updateFeed(feedId: string, items: RssFeedItem[]): AsyncResult<void> {
    const feed = this.feeds.get(feedId);
    if (!feed) {
      return makeErrorResult(new Error(`Feed ${feedId} not found`));
    }

    const updatedFeed: RssFeed = {
      ...feed,
      items: [...feed.items, ...items],
    };
    this.feeds.set(feedId, updatedFeed);

    // Notify subscribers via Firebase function
    const feedSubscriptions = this.subscriptions.get(feed.link);
    if (feedSubscriptions) {
      for (const subscription of feedSubscriptions) {
        const postResult = await requestPost(subscription.callbackUrl, {
          status: {
            code: 200,
            http: '200',
            feed: feed.link,
          },
          items: items.map((item) => ({
            id: item.id,
            title: item.title,
            summary: item.description ?? '',
            permalinkUrl: item.link,
            published: item.pubDate.getTime(),
            updated: item.pubDate.getTime(),
          })),
        });
        if (!postResult.success) {
          logger.error(prefixError(postResult.error, 'Error notifying feed subscribers'), {
            error: postResult.error,
            feedId,
            callbackUrl: subscription.callbackUrl,
          });
        }
      }
    }

    return makeSuccessResult(undefined);
  }

  private convertToRssXml(feed: RssFeed): string {
    // Basic RSS 2.0 format
    return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${feed.title}</title>
    ${feed.description ? `<description>${feed.description}</description>` : ''}
    <link>${feed.link}</link>
    ${feed.items
      .map(
        (item: RssFeedItem) => `
    <item>
      <title>${item.title}</title>
      ${item.description ? `<description>${item.description}</description>` : ''}
      <link>${item.link}</link>
      <guid>${item.id}</guid>
      <pubDate>${item.pubDate.toUTCString()}</pubDate>
      ${item.content ? `<content:encoded><![CDATA[${item.content}]]></content:encoded>` : ''}
    </item>`
      )
      .join('')}
  </channel>
</rss>`;
  }
}

async function main(): AsyncResult<void> {
  const server = new RssServer({port: RSS_SERVER_PORT});
  return await server.start();
}

// eslint-disable-next-line no-restricted-syntax
try {
  await main();
} catch (error) {
  logger.error(prefixError(upgradeUnknownError(error), 'Error starting RSS server'));
  process.exit(1);
}
