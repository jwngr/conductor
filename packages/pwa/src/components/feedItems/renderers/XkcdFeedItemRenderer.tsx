import type React from 'react';

import {SharedFeedItemHelpers} from '@shared/lib/feedItems.shared';
import {assertNever} from '@shared/lib/utils.shared';

import {AsyncStatus} from '@shared/types/asyncState.types';
import type {XkcdFeedItem} from '@shared/types/feedItems.types';

import {useExplainXkcdMarkdown} from '@sharedClient/hooks/feedItems.hooks';

import {FlexColumn} from '@src/components/atoms/Flex';
import {Text} from '@src/components/atoms/Text';
import {FeedItemHeader, FeedItemWrapper} from '@src/components/feedItems/FeedItem';
import {ImportingFeedItem} from '@src/components/feedItems/ImportingFeedItem';
import {Markdown} from '@src/components/Markdown';

const XkcdImageAndAltText: React.FC<{
  readonly imageUrl: string;
  readonly altText: string;
}> = (args) => {
  const {imageUrl, altText} = args;

  // TODO: Handle more complex comics, like https://xkcd.com/3081/ which is wrapped in a link.
  return (
    <FlexColumn gap={4} align="center">
      <img className="w-auto max-w-[960px]" src={imageUrl} alt={altText} />
      <Text as="h5">Title text</Text>
      <Text as="p" light className="max-w-prose italic">
        {altText}
      </Text>
    </FlexColumn>
  );
};

const ExplainXkcdContent: React.FC<{readonly feedItem: XkcdFeedItem}> = ({feedItem}) => {
  const markdownState = useExplainXkcdMarkdown(feedItem);

  switch (markdownState.status) {
    case AsyncStatus.Idle:
    case AsyncStatus.Pending:
      return <Text as="p">Loading Explain XKCD content...</Text>;
    case AsyncStatus.Error:
      return (
        <Text as="p" className="text-error">
          Error loading Explain XKCD content: {markdownState.error.message}
        </Text>
      );
    case AsyncStatus.Success:
      return (
        <>
          <Text as="h5">Explanation from Explain XKCD</Text>
          <Markdown content={markdownState.value} />
        </>
      );
    default:
      assertNever(markdownState);
  }
};

export const XkcdFeedItemRenderer: React.FC<{readonly feedItem: XkcdFeedItem}> = ({feedItem}) => {
  const hasFeedItemEverBeenImported = SharedFeedItemHelpers.hasEverBeenImported(feedItem);

  let mainContent: React.ReactNode;
  if (!hasFeedItemEverBeenImported) {
    mainContent = <ImportingFeedItem feedItem={feedItem} />;
  } else if (!feedItem.xkcd) {
    mainContent = <Text as="p">No XKCD comic found</Text>;
  } else {
    mainContent = (
      <>
        <XkcdImageAndAltText
          imageUrl={feedItem.xkcd.imageUrlLarge}
          altText={feedItem.xkcd.altText}
        />
        <ExplainXkcdContent feedItem={feedItem} />
      </>
    );
  }

  return (
    <FeedItemWrapper>
      <FeedItemHeader feedItem={feedItem} />
      {mainContent}
    </FeedItemWrapper>
  );
};
