import type React from 'react';

import type {FeedItem} from '@shared/types/feedItems.types';

import {ExternalLink} from '@src/components/atoms/Link';
import {Spacer} from '@src/components/atoms/Spacer';
import {Text} from '@src/components/atoms/Text';
import {FeedItemActions} from '@src/components/feedItems/FeedItemActions';
import {Markdown} from '@src/components/Markdown';

export const FeedItemWrapper: React.FC<{readonly children: React.ReactNode}> = ({children}) => {
  return <div className="flex flex-1 flex-col gap-3 overflow-auto p-5">{children}</div>;
};

export const FeedItemHeader: React.FC<{readonly feedItem: FeedItem}> = ({feedItem}) => {
  return (
    <div className="flex">
      <ExternalLink href={feedItem.url}>
        <Text as="h1" bold>
          {feedItem.title}
        </Text>
      </ExternalLink>
      <Spacer flex />
      <FeedItemActions feedItem={feedItem} />
    </div>
  );
};

export const FeedItemSummary: React.FC<{readonly feedItem: FeedItem}> = ({feedItem}) => {
  if (feedItem.summary === null) {
    return <Text as="p">No summary generated</Text>;
  }

  if (feedItem.summary.length === 0) {
    return <Text as="p">Summary empty</Text>;
  }

  return <Markdown content={feedItem.summary.replace(/•/g, '*')} />;
};
