import type {RssMiniFeedSource} from '@shared/types/feedSources.types';
import type {UserFeedSubscriptionId} from '@shared/types/userFeedSubscriptions.types';

export interface SubscribeAccountToRSSFeedOnCallResponse {
  readonly miniFeedSource: RssMiniFeedSource;
  readonly userFeedSubscriptionId: UserFeedSubscriptionId;
}
