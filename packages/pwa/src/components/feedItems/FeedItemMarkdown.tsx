import type React from 'react';
import {useState} from 'react';

import {assertNever} from '@shared/lib/utils.shared';

import {AsyncStatus} from '@shared/types/asyncState.types';
import type {FeedItem} from '@shared/types/feedItems.types';

import {
  useFeedItemDefuddleMarkdown,
  useFeedItemMarkdown,
} from '@sharedClient/hooks/feedItems.hooks';

import {Button} from '@src/components/atoms/Button';
import {Text} from '@src/components/atoms/Text';
import {Markdown} from '@src/components/Markdown';

type RenderStrategy = 'firecrawl' | 'defuddle';

const FirecrawlMarkdownRenderer: React.FC<{readonly feedItem: FeedItem}> = ({feedItem}) => {
  const markdownState = useFeedItemMarkdown(feedItem);

  switch (markdownState.status) {
    case AsyncStatus.Idle:
    case AsyncStatus.Pending:
      return <Text as="p">Loading Firecrawl markdown...</Text>;
    case AsyncStatus.Error:
      return (
        <Text as="p" className="text-error">
          Error loading Firecrawl markdown: {markdownState.error.message}
        </Text>
      );
    case AsyncStatus.Success:
      return <Markdown content={markdownState.value} />;
    default:
      assertNever(markdownState);
  }
};

const DefuddleMarkdownRenderer: React.FC<{readonly feedItem: FeedItem}> = ({feedItem}) => {
  const markdownState = useFeedItemDefuddleMarkdown(feedItem);

  switch (markdownState.status) {
    case AsyncStatus.Idle:
    case AsyncStatus.Pending:
      return <Text as="p">Loading Defuddle markdown...</Text>;
    case AsyncStatus.Error:
      return (
        <Text as="p" className="text-error">
          Error loading Defuddle markdown: {markdownState.error.message}
        </Text>
      );
    case AsyncStatus.Success:
      return <Markdown content={markdownState.value} />;
    default:
      assertNever(markdownState);
  }
};

export const FeedItemMarkdown: React.FC<{readonly feedItem: FeedItem}> = ({feedItem}) => {
  const [renderStrategy, setRenderStrategy] = useState<RenderStrategy>('firecrawl');

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <Button
          variant={renderStrategy === 'firecrawl' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setRenderStrategy('firecrawl')}
        >
          Firecrawl
        </Button>
        <Button
          variant={renderStrategy === 'defuddle' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setRenderStrategy('defuddle')}
        >
          Defuddle
        </Button>
      </div>

      {renderStrategy === 'firecrawl' ? (
        <FirecrawlMarkdownRenderer feedItem={feedItem} />
      ) : (
        <DefuddleMarkdownRenderer feedItem={feedItem} />
      )}
    </div>
  );
};
