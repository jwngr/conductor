import type {IntervalFeedItem} from '@shared/types/feedItems.types';

import {P} from '@src/components/atoms/Text';
import {SimpleFeedItemRenderer} from '@src/components/feedItems/FeedItem';

export const IntervalFeedItemRenderer: React.FC<{readonly feedItem: IntervalFeedItem}> = ({
  feedItem,
}) => {
  return (
    <SimpleFeedItemRenderer feedItem={feedItem}>
      <P>Interval feed item</P>
      <pre>{JSON.stringify(feedItem, null, 2)}</pre>
    </SimpleFeedItemRenderer>
  );
};
