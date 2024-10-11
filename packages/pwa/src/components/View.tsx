import {ViewType} from '@shared/types/query';
import React from 'react';
import {Link} from 'react-router-dom';

import {useFeedItems} from '../lib/items';
import {Text} from './atoms/Text';

export const View: React.FC<{viewType: ViewType}> = ({viewType}) => {
  const {feedItems, isLoading, error} = useFeedItems({viewType});

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      <h2>{viewType}</h2>
      <ul>
        {feedItems.map((feedItem) => {
          return (
            <li key={feedItem.itemId}>
              <Link to={`/items/${feedItem.itemId}`}>
                <Text as="p" bold>
                  {feedItem.url}
                </Text>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
