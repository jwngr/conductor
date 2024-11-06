import {FieldValue} from 'firebase/firestore';

import {FeedItemId} from '@shared/types/feedItems';
import {UserId} from '@shared/types/user';

export type ImportQueueItemId = string;

export interface ImportQueueItem {
  readonly importQueueItemId: ImportQueueItemId;
  readonly userId: UserId;
  readonly feedItemId: FeedItemId;
  readonly url: string;
  readonly createdTime: FieldValue;
  readonly lastUpdatedTime: FieldValue;
}
