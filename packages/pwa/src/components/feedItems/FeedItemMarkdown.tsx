import type React from 'react';
import {useState} from 'react';

import {assertNever} from '@shared/lib/utils.shared';

import {AsyncStatus} from '@shared/types/asyncState.types';
import type {FeedItem} from '@shared/types/feedItems.types';

import {
  DEFAULT_ROUTE_HERO_PAGE_ACTION,
  REFRESH_HERO_PAGE_ACTION,
} from '@sharedClient/lib/heroActions.client';

import {
  useFeedItemDefuddleMarkdown,
  useFeedItemMarkdown,
} from '@sharedClient/hooks/feedItems.hooks';

import {Button} from '@src/components/atoms/Button';
import {ErrorArea} from '@src/components/errors/ErrorArea';
import {LoadingArea} from '@src/components/loading/LoadingArea';
import {Markdown} from '@src/components/Markdown';

type RenderStrategy = 'firecrawl' | 'defuddle';

const MarkdownErrorArea: React.FC<{readonly error: Error; readonly title: string}> = (args) => {
  const {error, title} = args;
  return (
    <ErrorArea
      error={error}
      title={title}
      subtitle="Refreshing may resolve the issue. If the problem persists, please contact support."
      actions={[DEFAULT_ROUTE_HERO_PAGE_ACTION, REFRESH_HERO_PAGE_ACTION]}
    />
  );
};

const FirecrawlMarkdownRenderer: React.FC<{readonly feedItem: FeedItem}> = ({feedItem}) => {
  const markdownState = useFeedItemMarkdown(feedItem);

  switch (markdownState.status) {
    case AsyncStatus.Idle:
    case AsyncStatus.Pending:
      return <LoadingArea text="Loading Firecrawl markdown..." />;
    case AsyncStatus.Error:
      return (
        <MarkdownErrorArea error={markdownState.error} title="Error loading Firecrawl markdown" />
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
      return <LoadingArea text="Loading Defuddle markdown..." />;
    case AsyncStatus.Error:
      return (
        <MarkdownErrorArea error={markdownState.error} title="Error loading Defuddle markdown" />
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
