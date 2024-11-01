import React from 'react';
import styled from 'styled-components';

import {FeedItem} from '@shared/types/feedItems';

import {FlexColumn, FlexRow} from '@src/components/atoms/Flex';
import {Spacer} from '@src/components/atoms/Spacer';
import {Text} from '@src/components/atoms/Text';

import {FeedItemActions} from './FeedItemActions';

export const FeedItemWrapper = styled(FlexColumn).attrs({gap: 12})`
  flex: 1;
  overflow: auto;
  padding: 20px;
`;

const FeedItemHeaderWrapper = styled(FlexRow)``;

export const FeedItemHeader: React.FC<{readonly feedItem: FeedItem}> = ({feedItem}) => {
  return (
    <FeedItemHeaderWrapper>
      <Text as="h1" bold>
        {feedItem.title}
      </Text>
      <Spacer flex />
      <FeedItemActions feedItemId={feedItem.itemId} />
    </FeedItemHeaderWrapper>
  );
};