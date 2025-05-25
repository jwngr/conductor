import Defuddle from 'defuddle';
import type React from 'react';
import {useEffect, useState} from 'react';

import {syncTry} from '@shared/lib/errorUtils.shared';
import {assertNever} from '@shared/lib/utils.shared';

import {AsyncStatus} from '@shared/types/asyncState.types';
import {FeedItemType, type FeedItem} from '@shared/types/feedItems.types';

import {useFeedItemHtml, useFeedItemMarkdown} from '@sharedClient/hooks/feedItems.hooks';

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
  const htmlState = useFeedItemHtml(feedItem);
  const [defuddleContent, setDefuddleContent] = useState<string | null>(null);
  const [defuddleError, setDefuddleError] = useState<string | null>(null);

  useEffect(() => {
    if (htmlState.status === AsyncStatus.Success) {
      const parseResult = syncTry(() => {
        // Parse the HTML string into a document.
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlState.value, 'text/html');

        // Use Defuddle to extract Markdown from the raw HTML document.
        const defuddle = new Defuddle(doc, {
          url: feedItem.feedItemType === FeedItemType.Interval ? undefined : feedItem.url,
          markdown: true,
          removeExactSelectors: true,
          removePartialSelectors: true,
        });
        const result = defuddle.parse();

        return result.content as string;
      });

      if (parseResult.success) {
        setDefuddleContent(parseResult.value);
        setDefuddleError(null);
      } else {
        setDefuddleError(parseResult.error.message);
        setDefuddleContent(null);
      }
    }
  }, [htmlState, feedItem]);

  switch (htmlState.status) {
    case AsyncStatus.Idle:
    case AsyncStatus.Pending:
      return <Text as="p">Loading HTML for Defuddle processing...</Text>;
    case AsyncStatus.Error:
      return (
        <Text as="p" className="text-error">
          Error loading HTML: {htmlState.error.message}
        </Text>
      );
    case AsyncStatus.Success:
      if (defuddleError) {
        return (
          <Text as="p" className="text-error">
            Error processing with Defuddle: {defuddleError}
          </Text>
        );
      }

      if (defuddleContent === null) {
        return <Text as="p">Processing with Defuddle...</Text>;
      }

      return <Markdown content={defuddleContent} />;
    default:
      assertNever(htmlState);
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
