import type React from 'react';

import {assertNever} from '@shared/lib/utils.shared';

import {AsyncStatus} from '@shared/types/asyncState.types';
import type {XkcdFeedItem} from '@shared/types/feedItems.types';

import {
  DEFAULT_ROUTE_HERO_PAGE_ACTION,
  REFRESH_HERO_PAGE_ACTION,
} from '@sharedClient/lib/heroActions.client';

import {useExplainXkcdMarkdown} from '@sharedClient/hooks/feedItems.hooks';

import {FlexColumn} from '@src/components/atoms/Flex';
import {H5, P} from '@src/components/atoms/Text';
import {ErrorArea} from '@src/components/errors/ErrorArea';
import {SimpleFeedItemRenderer} from '@src/components/feedItems/FeedItem';
import {LoadingArea} from '@src/components/loading/LoadingArea';
import {Markdown} from '@src/components/Markdown';

import {firebaseService} from '@src/lib/firebase.pwa';

const XkcdImageAndAltText: React.FC<{
  readonly imageUrl: string;
  readonly altText: string;
}> = (args) => {
  const {imageUrl, altText} = args;

  // TODO: Handle more complex comics, like https://xkcd.com/3081/ which is wrapped in a link.
  return (
    <FlexColumn gap={4} align="center">
      <img className="w-auto max-w-[960px]" src={imageUrl} alt={altText} />
      <H5>Title text</H5>
      <P light className="max-w-prose italic">
        {altText}
      </P>
    </FlexColumn>
  );
};

const ExplainXkcdContent: React.FC<{readonly feedItem: XkcdFeedItem}> = ({feedItem}) => {
  const markdownState = useExplainXkcdMarkdown({feedItem, firebaseService});

  switch (markdownState.status) {
    case AsyncStatus.Idle:
    case AsyncStatus.Pending:
      return <LoadingArea text="Loading Explain XKCD content..." />;
    case AsyncStatus.Error:
      return (
        <ErrorArea
          error={markdownState.error}
          title="Error loading Explain XKCD content"
          subtitle="Refreshing may resolve the issue. If the problem persists, please contact support."
          actions={[DEFAULT_ROUTE_HERO_PAGE_ACTION, REFRESH_HERO_PAGE_ACTION]}
        />
      );
    case AsyncStatus.Success:
      return (
        <>
          <H5>Explanation from Explain XKCD</H5>
          <Markdown content={markdownState.value} />
        </>
      );
    default:
      assertNever(markdownState);
  }
};

export const XkcdFeedItemRenderer: React.FC<{readonly feedItem: XkcdFeedItem}> = ({feedItem}) => {
  return (
    <SimpleFeedItemRenderer feedItem={feedItem}>
      <XkcdImageAndAltText
        imageUrl={feedItem.content.imageUrlLarge}
        altText={feedItem.content.altText}
      />
      <ExplainXkcdContent feedItem={feedItem} />
    </SimpleFeedItemRenderer>
  );
};
