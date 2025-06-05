import type React from 'react';

import {assertNever} from '@shared/lib/utils.shared';

import {FeedItemContentType} from '@shared/types/feedItems.types';
import type {FeedItem, FeedItemWithUrl} from '@shared/types/feedItems.types';

import {ExternalLink} from '@src/components/atoms/Link';
import {Spacer} from '@src/components/atoms/Spacer';
import {Text} from '@src/components/atoms/Text';
import {FeedItemActions} from '@src/components/feedItems/FeedItemActions';
import {Markdown} from '@src/components/Markdown';

export const FeedItemWrapper: React.FC<{readonly children: React.ReactNode}> = ({children}) => {
  return <div className="flex flex-1 flex-col gap-3 overflow-auto p-5">{children}</div>;
};

const FeedItemHeaderTitle: React.FC<{readonly feedItem: FeedItem}> = ({feedItem}) => {
  const titleContentWithoutLink = (
    <Text as="h1" bold>
      {feedItem.title}
    </Text>
  );

  switch (feedItem.feedItemContentType) {
    case FeedItemContentType.Interval:
      return titleContentWithoutLink;
    case FeedItemContentType.Article:
    case FeedItemContentType.Tweet:
    case FeedItemContentType.Video:
    case FeedItemContentType.Website:
    case FeedItemContentType.Xkcd:
    case FeedItemContentType.YouTube:
      return <ExternalLink href={feedItem.url}>{titleContentWithoutLink}</ExternalLink>;
    default:
      assertNever(feedItem);
  }
};

export const FeedItemHeader: React.FC<{readonly feedItem: FeedItem}> = ({feedItem}) => {
  return (
    <div className="flex">
      <FeedItemHeaderTitle feedItem={feedItem} />
      <Spacer flex />
      <FeedItemActions feedItem={feedItem} />
    </div>
  );
};

export const FeedItemSummary: React.FC<{readonly feedItem: FeedItemWithUrl}> = ({feedItem}) => {
  if (feedItem.summary === null) {
    return <Text as="p">No summary generated</Text>;
  }

  if (feedItem.summary.length === 0) {
    return <Text as="p">Summary empty</Text>;
  }

  return <Markdown content={feedItem.summary.replace(/•/g, '*')} />;
};
