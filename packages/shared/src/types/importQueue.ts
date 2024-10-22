import {FieldValue} from 'firebase/firestore';

import {FeedItemId} from './feedItems';

export interface ImportQueueItem {
  readonly url: string;
  readonly feedItemId: FeedItemId;
  readonly createdTime: FieldValue;
  readonly lastUpdatedTime: FieldValue;
}
