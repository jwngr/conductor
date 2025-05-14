import {logger} from '@shared/services/logger.shared';

import type {RssFeed, RssFeedItem} from '@shared/types/rss.types';

import {RssServer} from '@src/server';

// TODO: Move this to a config file.
const RSS_SERVER_PORT = 6556;

async function main(): Promise<void> {
  // Create a new RSS server instance.
  const server = new RssServer({port: RSS_SERVER_PORT});

  // Add a sample feed.
  const feed: RssFeed = {
    id: 'test-feed',
    title: 'Test Feed',
    description: 'A test RSS feed',
    link: 'http://example.com/test/1',
    items: [
      {
        id: '1',
        title: 'First Post',
        description: 'This is the first post',
        link: 'http://example.com/test/1',
        pubDate: new Date(),
        content: '<p>This is the content of the first post</p>',
      },
    ],
  };

  server.addFeed(feed);

  // Start the server.
  await server.start();

  // Add a new item to the feed after 5 seconds
  setTimeout(async () => {
    const newItem: RssFeedItem = {
      id: '2',
      title: 'Second Post',
      description: 'This is the second post',
      link: 'http://example.com/test/2',
      pubDate: new Date(),
      content: '<p>This is the content of post #2</p>',
    };

    await server.updateFeed('test-feed', [newItem]);
  }, 5000);
}

main().catch((error) => {
  logger.error(error);
  process.exit(1);
});
