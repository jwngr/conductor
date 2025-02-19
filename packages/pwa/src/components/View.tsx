import {getFunctions, httpsCallable} from 'firebase/functions';
import type React from 'react';
import {useState} from 'react';
import styled from 'styled-components';

import {logger} from '@shared/services/logger.shared';

import {prefixError} from '@shared/lib/errorUtils.shared';
import {Urls} from '@shared/lib/urls.shared';

import type {FeedItem} from '@shared/types/feedItems.types';
import type {ViewType} from '@shared/types/query.types';
import {ThemeColor} from '@shared/types/theme.types';

import {useFeedItems} from '@sharedClient/services/feedItems.client';

import {Button, ButtonVariant} from '@src/components/atoms/Button';
import {FlexColumn} from '@src/components/atoms/Flex';
import {Link} from '@src/components/atoms/Link';
import {Text} from '@src/components/atoms/Text';

const ViewListItemWrapper = styled(FlexColumn).attrs({justify: 'center', gap: 4})`
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 4px;

  &:hover {
    background-color: ${({theme}) => theme.colors[ThemeColor.Neutral100]};
  }
`;

const ViewListItem: React.FC<{readonly feedItem: FeedItem}> = ({feedItem}) => {
  return (
    <Link to={Urls.forFeedItem(feedItem.feedItemId)}>
      <ViewListItemWrapper key={feedItem.feedItemId}>
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
    return <div>Loading...</div>;
  }

  if (error) {
    // TODO: Introduce proper error screen.
    logger.error(prefixError(error, 'Error loading feed items'), {viewType});
    return <div>Error: {error.message}</div>;
  }

  if (feedItems.length === 0) {
    return <div>No items</div>;
  }

  return (
    <ul>
      {feedItems.map((feedItem) => (
        <ViewListItem key={feedItem.feedItemId} feedItem={feedItem} />
      ))}
    </ul>
  );
};

const ViewWrapper = styled(FlexColumn)`
  flex: 1;
  padding: 20px;
  overflow: auto;
`;

const PoemGenerator: React.FC = () => {
  const [poem, setPoem] = useState('');
  async function generatePoem(topic: string) {
    const poemFlow = httpsCallable(getFunctions(), 'generatePoem');
    const response = await poemFlow(topic);
    setPoem(response.data as string);
  }

  return (
    <FlexColumn>
      <Button
        onClick={async () => void generatePoem('Data visualizations about american football')}
        variant={ButtonVariant.Primary}
      >
        Generate poem
      </Button>
      <Text as="p">Poem: {poem ?? 'No poem'}</Text>
    </FlexColumn>
  );
};

export const View: React.FC<{viewType: ViewType}> = ({viewType}) => {
  return (
    <ViewWrapper>
      <h2>{viewType}</h2>
      <PoemGenerator />
      <ViewList viewType={viewType} />
    </ViewWrapper>
  );
};
