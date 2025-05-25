import type React from 'react';

import {assertNever} from '@shared/lib/utils.shared';

import {AsyncStatus} from '@shared/types/asyncState.types';
import type {FeedItem} from '@shared/types/feedItems.types';

import {useFeedItemMarkdown} from '@sharedClient/hooks/feedItems.hooks';

import {Text} from '@src/components/atoms/Text';
import {Markdown} from '@src/components/Markdown';

export const FeedItemMarkdown: React.FC<{readonly feedItem: FeedItem}> = ({feedItem}) => {
  const markdownState = useFeedItemMarkdown(feedItem);

  switch (markdownState.status) {
    case AsyncStatus.Idle:
    case AsyncStatus.Pending:
      return <Text as="p">Loading markdown...</Text>;
    case AsyncStatus.Error:
      return (
        <Text as="p" className="text-error">
          Error loading markdown: {markdownState.error.message}
        </Text>
      );
    case AsyncStatus.Success:
      return <Markdown content={markdownState.value} />;
    default:
      assertNever(markdownState);
  }
};
