import {useEffect, useRef} from 'react';
import type React from 'react';
import styled from 'styled-components';

import {logger} from '@shared/services/logger.shared';

import {Urls} from '@shared/lib/urls.shared';

import type {FeedItem} from '@shared/types/feedItems.types';
import type {ViewType} from '@shared/types/query.types';
import {ThemeColor} from '@shared/types/theme.types';

import {useFocusStore} from '@sharedClient/stores/FocusStore';

import {useFeedItems} from '@sharedClient/services/feedItems.client';

import {FlexColumn} from '@src/components/atoms/Flex';
import {Link} from '@src/components/atoms/Link';
import {Text} from '@src/components/atoms/Text';
import {ViewKeyboardShortcutHandler} from '@src/components/views/ViewKeyboardShortcutHandler';

interface ViewListItemWrapperProps {
  readonly $isFocused: boolean;
}

const ViewListItemWrapper = styled.div<ViewListItemWrapperProps>`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 4px;
  outline: none;

  &:hover,
  &:focus-visible {
    background-color: ${({theme}) => theme.colors[ThemeColor.Neutral100]};
  }

  ${({$isFocused, theme}) =>
    $isFocused &&
    `
      background-color: ${theme.colors[ThemeColor.Neutral100]};
      outline: 2px solid ${theme.colors[ThemeColor.Neutral500]};
    `}
`;

const ViewListItem: React.FC<{
  readonly feedItem: FeedItem;
  readonly viewType: ViewType;
}> = ({feedItem}) => {
  const {focusedFeedItemId, setFocusedFeedItemId} = useFocusStore();
  const itemRef = useRef<HTMLDivElement>(null);

  const isFocused = focusedFeedItemId === feedItem.feedItemId;

  useEffect(() => {
    if (isFocused && itemRef.current) {
      itemRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [isFocused]);

  return (
    <Link to={Urls.forFeedItem(feedItem.feedItemId)}>
      <ViewListItemWrapper
        ref={itemRef}
        $isFocused={isFocused}
        tabIndex={0}
        onFocus={() => setFocusedFeedItemId(feedItem.feedItemId)}
        onBlur={() => setFocusedFeedItemId(null)}
      >
        <Text as="p" bold>
          {feedItem.title || 'No title'}
        </Text>
        <Text as="p" light>
          {feedItem.url}
        </Text>
      </ViewListItemWrapper>
    </Link>
  );
};

const ViewList: React.FC<{viewType: ViewType}> = ({viewType}) => {
  const {feedItems, isLoading, error} = useFeedItems({viewType});

  if (isLoading) {
    // TODO: Introduce proper loading screen.
    return <div>Loading...</div>;
  }

  if (error) {
    // TODO: Introduce proper error screen.
    logger.error(new Error('Error loading feed items'), {error, viewType});
    return <div>Error: {error.message}</div>;
  }

  if (feedItems.length === 0) {
    // TODO: Introduce proper empty state screen.
    return <div>No items</div>;
  }

  return (
    <>
      <ul>
        {feedItems.map((feedItem) => (
          <ViewListItem key={feedItem.feedItemId} feedItem={feedItem} viewType={viewType} />
        ))}
      </ul>
      <ViewKeyboardShortcutHandler feedItems={feedItems} />
    </>
  );
};

const ViewWrapper = styled(FlexColumn)`
  flex: 1;
  padding: 20px;
  overflow: auto;
`;

export const View: React.FC<{viewType: ViewType}> = ({viewType}) => {
  return (
    <ViewWrapper>
      <h2>{viewType}</h2>
      <ViewList viewType={viewType} />
    </ViewWrapper>
  );
};
