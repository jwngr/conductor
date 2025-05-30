import type {Context} from 'hono';
import {Hono} from 'hono';
import {logger as honoLogger} from 'hono/logger';

import {logger} from '@shared/services/logger.shared';

import {asyncTry} from '@shared/lib/errorUtils.shared';
import {isValidUrl} from '@shared/lib/urls.shared';

import type {
  RssFeed,
  RssFeedItem,
  RssFeedManager,
  RssFeedSubscription,
} from '@shared/types/rss.types';
import type {Func} from '@shared/types/utils.types';

export function setupRoutes(feedManager: RssFeedManager): Hono {
  const app = new Hono();

  app.use(honoLogger());

  app.get('/feed/:feedId', makeFetchFeedRouteHandler(feedManager));
  app.post('/subscribe', makeSubscribeToFeedRouteHandler(feedManager));
  app.post('/unsubscribe', makeUnsubscribeFromFeedRouteHandler(feedManager));

  return app;
}

function makeFetchFeedRouteHandler(feedManager: RssFeedManager): Func<Context, Promise<Response>> {
  return async (c) => {
    const feedId = c.req.param('feedId');
    const feed = feedManager.getFeed({feedId});

    logger.log('Fetching feed', {feedId});

    if (!feed) {
      return c.text('Feed not found', 404);
    }

    const rss = convertToRssXml(feed);
    return c.text(rss, 200, {'Content-Type': 'application/xml'});
  };
}

function makeSubscribeToFeedRouteHandler(
  feedManager: RssFeedManager
): Func<Context, Promise<Response>> {
  return async (c) => {
    const jsonResult = await asyncTry(async () => c.req.json<RssFeedSubscription>());
    if (!jsonResult.success) return c.json(jsonResult.error, 400);

    const {feedUrl, callbackUrl} = jsonResult.value;

    logger.log('Subscribing to feed', {feedUrl, callbackUrl});

    if (!isValidUrl(feedUrl)) return c.text('Invalid feed URL', 400);
    if (!isValidUrl(callbackUrl)) return c.text('Invalid callback URL', 400);

    feedManager.subscribe({feedUrl, callbackUrl});

    return c.json({success: true}, 200);
  };
}

function makeUnsubscribeFromFeedRouteHandler(
  feedManager: RssFeedManager
): Func<Context, Promise<Response>> {
  return async (c) => {
    const jsonResult = await asyncTry(async () => c.req.json<{readonly feedUrl: string}>());
    if (!jsonResult.success) return c.json(jsonResult.error, 400);

    const {feedUrl} = jsonResult.value;

    logger.log('Unsubscribing from feed', {feedUrl});

    if (!isValidUrl(feedUrl)) return c.text('Invalid feed URL', 400);

    feedManager.unsubscribe({feedUrl});

    return c.json({success: true}, 200);
  };
}

function convertToRssXml(feed: RssFeed): string {
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
