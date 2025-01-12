import React, {useCallback, useEffect, useRef} from 'react';
import {useNavigate} from 'react-router-dom';
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

import {keyboardShortcutsService} from '@src/lib/shortcuts.pwa';

const StyledDiv = styled.div<{readonly $isFocused: boolean}>`
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

interface ViewListItemProps {
  readonly feedItem: FeedItem;
  readonly viewType: ViewType;
}

const ViewListItem: React.FC<ViewListItemProps> = ({feedItem}) => {
  const {focusedFeedItemId, setFocusedFeedItemId} = useFocusStore();
  const navigate = useNavigate();
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

  const handleClick = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      navigate(Urls.forFeedItem(feedItem.feedItemId));
    },
    [feedItem.feedItemId, navigate]
  );

  return (
    <Link to={Urls.forFeedItem(feedItem.feedItemId)} onClick={handleClick}>
      <StyledDiv
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
      </StyledDiv>
    </Link>
  );
};

const ViewList: React.FC<{viewType: ViewType}> = ({viewType}) => {
  const navigate = useNavigate();

  const {feedItems, isLoading, error} = useFeedItems({viewType});
  const {focusedFeedItemId, setFocusedFeedItemId, setFocusedViewType} = useFocusStore();

  const handleArrowDown = useCallback(() => {
    if (!feedItems.length) return;

    const currentIndex = focusedFeedItemId
      ? feedItems.findIndex((item) => item.feedItemId === focusedFeedItemId)
      : -1;

    if (currentIndex === -1 || currentIndex === feedItems.length - 1) {
      setFocusedFeedItemId(feedItems[0].feedItemId);
    } else {
      setFocusedFeedItemId(feedItems[currentIndex + 1].feedItemId);
    }
  }, [feedItems, focusedFeedItemId, setFocusedFeedItemId]);

  const handleArrowUp = useCallback(() => {
    if (!feedItems.length) return;

    const currentIndex = focusedFeedItemId
      ? feedItems.findIndex((item) => item.feedItemId === focusedFeedItemId)
      : -1;

    if (currentIndex === -1 || currentIndex === 0) {
      setFocusedFeedItemId(feedItems[feedItems.length - 1].feedItemId);
    } else {
      setFocusedFeedItemId(feedItems[currentIndex - 1].feedItemId);
    }
  }, [feedItems, focusedFeedItemId, setFocusedFeedItemId]);

  const handleEnter = useCallback(() => {
    if (!feedItems.length) return;

    if (focusedFeedItemId) {
      setFocusedViewType(viewType);
      navigate(Urls.forFeedItem(focusedFeedItemId));
    }
  }, [feedItems, focusedFeedItemId, navigate, setFocusedViewType, viewType]);

  useEffect(() => {
    const unsubscribeArrowDown = keyboardShortcutsService.registerShortcut(
      keyboardShortcutsService.forArrowDown(),
      handleArrowDown
    );

    const unsubscribeArrowUp = keyboardShortcutsService.registerShortcut(
      keyboardShortcutsService.forArrowUp(),
      handleArrowUp
    );

    const unsubscribeEnter = keyboardShortcutsService.registerShortcut(
      keyboardShortcutsService.forEnter(),
      handleEnter
    );

    return () => {
      unsubscribeArrowDown();
      unsubscribeArrowUp();
      unsubscribeEnter();
    };
  }, [handleArrowDown, handleArrowUp, handleEnter]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    // TODO: Introduce proper error screen.
    logger.error(new Error('Error loading feed items'), {error, viewType});
    return <div>Error: {error.message}</div>;
  }

  if (feedItems.length === 0) {
    return <div>No items</div>;
  }

  return (
    <ul>
      {feedItems.map((feedItem) => (
        <ViewListItem key={feedItem.feedItemId} feedItem={feedItem} viewType={viewType} />
      ))}
    </ul>
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
