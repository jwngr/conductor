import {FeedItem} from '@shared/types';
import {ViewType} from '@shared/types/query';
import React from 'react';
import {Link} from 'react-router-dom';

import {useFeedItems} from '../../lib/items';
import {Text} from '../atoms/Text';

const ViewListItem: React.FC<{feedItem: FeedItem}> = ({feedItem}) => {
  return (
    <li key={feedItem.itemId}>
      <Link to={`/items/${feedItem.itemId}`}>
        <Text as="p" bold>
          {feedItem.url}
        </Text>
      </Link>
    </li>
  );
};

const ViewList: React.FC<{viewType: ViewType}> = ({viewType}) => {
  const {feedItems, isLoading, error} = useFeedItems({viewType});

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (feedItems.length === 0) {
    return <div>No items</div>;
  }

  return (
    <ul>
      {feedItems.map((feedItem) => (
        <ViewListItem key={feedItem.itemId} feedItem={feedItem} />
      ))}
    </ul>
  );
};

export const View: React.FC<{viewType: ViewType}> = ({viewType}) => {
  return (
    <div>
      <h2>{viewType}</h2>
      <ViewList viewType={viewType} />
    </div>
  );
};
