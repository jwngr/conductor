import type {MiniFeedSource} from '@shared/types/feedSources.types';
import type {UserFeedSubscriptionId} from '@shared/types/userFeedSubscriptions.types';

export interface SubscribeAccountToRSSFeedOnCallResponse {
  readonly miniFeedSource: MiniFeedSource;
  readonly userFeedSubscriptionId: UserFeedSubscriptionId;
}
