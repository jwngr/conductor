import type React from 'react';

import type {FeedItem} from '@shared/types/feedItems.types';

import {Spacer} from '@src/components/atoms/Spacer';
import {Text} from '@src/components/atoms/Text';
import {FeedItemActions} from '@src/components/feedItems/FeedItemActions';

export const FeedItemWrapper: React.FC<{readonly children: React.ReactNode}> = ({children}) => {
  return <div className="flex flex-1 flex-col gap-3 overflow-auto p-5">{children}</div>;
};

export const FeedItemHeader: React.FC<{readonly feedItem: FeedItem}> = ({feedItem}) => {
  return (
    <div className="flex">
      <Text as="h1" bold>
        {feedItem.title}
      </Text>
      <Spacer flex />
      <FeedItemActions feedItem={feedItem} />
    </div>
  );
};
