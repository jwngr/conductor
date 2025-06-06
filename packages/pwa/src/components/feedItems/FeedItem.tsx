import type React from 'react';

import {SharedFeedItemHelpers} from '@shared/lib/feedItems.shared';
import {assertNever} from '@shared/lib/utils.shared';

import {FeedItemContentType} from '@shared/types/feedItems.types';
import type {FeedItem} from '@shared/types/feedItems.types';

import type {WithChildren} from '@sharedClient/types/utils.client.types';

import {FlexColumn} from '@src/components/atoms/Flex';
import {ExternalLink} from '@src/components/atoms/Link';
import {Spacer} from '@src/components/atoms/Spacer';
import {H1, P} from '@src/components/atoms/Text';
import {FeedItemActions} from '@src/components/feedItems/FeedItemActions';
import {ImportingFeedItem} from '@src/components/feedItems/ImportingFeedItem';
import {Markdown} from '@src/components/Markdown';

const FeedItemHeaderTitle: React.FC<{readonly feedItem: FeedItem}> = ({feedItem}) => {
  const titleContentWithoutLink = <H1 bold>{feedItem.content.title}</H1>;

  switch (feedItem.feedItemContentType) {
    case FeedItemContentType.Interval:
      return titleContentWithoutLink;
    case FeedItemContentType.Article:
    case FeedItemContentType.Tweet:
    case FeedItemContentType.Video:
    case FeedItemContentType.Website:
    case FeedItemContentType.Xkcd:
    case FeedItemContentType.YouTube:
      return <ExternalLink href={feedItem.content.url}>{titleContentWithoutLink}</ExternalLink>;
    default:
      assertNever(feedItem);
  }
};

const FeedItemHeader: React.FC<{readonly feedItem: FeedItem}> = ({feedItem}) => {
  return (
    <div className="flex">
      <FeedItemHeaderTitle feedItem={feedItem} />
      <Spacer flex />
      <FeedItemActions feedItem={feedItem} />
    </div>
  );
};

export const FeedItemSummary: React.FC<{readonly summary: string | null}> = ({summary}) => {
  if (summary === null) {
    return <P>No summary generated</P>;
  }

  if (summary.length === 0) {
    return <P>Summary empty</P>;
  }

  return <Markdown content={summary.replace(/•/g, '*')} />;
};

interface SimpleFeedItemRendererProps extends WithChildren {
  readonly feedItem: FeedItem;
}

export const SimpleFeedItemRenderer: React.FC<SimpleFeedItemRendererProps> = ({
  feedItem,
  children,
}) => {
  const hasFeedItemEverBeenImported = SharedFeedItemHelpers.hasEverBeenImported(feedItem);

  let mainContent: React.ReactNode;
  if (!hasFeedItemEverBeenImported) {
    mainContent = <ImportingFeedItem feedItem={feedItem} />;
  } else {
    mainContent = children;
  }

  return (
    <FlexColumn flex gap={3} className="overflow-auto p-5">
      <FeedItemHeader feedItem={feedItem} />
      {mainContent}
    </FlexColumn>
  );
};
