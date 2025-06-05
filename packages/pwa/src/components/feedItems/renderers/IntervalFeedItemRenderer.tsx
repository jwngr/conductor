import type {IntervalFeedItem} from '@shared/types/feedItems.types';

import {Text} from '@src/components/atoms/Text';
import {SimpleFeedItemRenderer} from '@src/components/feedItems/FeedItem';

export const IntervalFeedItemRenderer: React.FC<{readonly feedItem: IntervalFeedItem}> = ({
  feedItem,
}) => {
  return (
    <SimpleFeedItemRenderer feedItem={feedItem}>
      <Text as="p">Interval feed item</Text>
      <pre>{JSON.stringify(feedItem, null, 2)}</pre>
    </SimpleFeedItemRenderer>
  );
};
