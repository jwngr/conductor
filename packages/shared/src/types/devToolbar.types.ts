import type {Func, Supplier, Unsubscribe} from '@shared/types/utils.types';

export enum DevToolbarSectionType {
  FeedItemImporter = 'FEED_ITEM_IMPORTER',
  UserFeedSubscriber = 'USER_FEED_SUBSCRIBER',
  IndividualFeedItemActions = 'INDIVIDUAL_FEED_ITEM_ACTIONS',
}

export interface DevToolbarSection {
  readonly sectionType: DevToolbarSectionType;
  readonly title: string;
  readonly renderSection: Supplier<React.ReactNode>;
}

export interface DevToolbarStore {
  readonly sections: readonly DevToolbarSection[];
  readonly registerSection: Func<DevToolbarSection, Unsubscribe>;
}
