import type {Func, Supplier, Unsubscribe} from '@shared/types/utils.types';

export enum DevToolbarSectionType {
  FeedItemImporter = 'FEED_ITEM_IMPORTER',
  IndividualFeedItemActions = 'INDIVIDUAL_FEED_ITEM_ACTIONS',
}

export interface DevToolbarSectionInfo {
  readonly sectionType: DevToolbarSectionType;
  readonly title: string;
  readonly renderSection: Supplier<React.ReactNode>;
  readonly requiresAuth: boolean;
}

export interface DevToolbarStore {
  readonly sections: readonly DevToolbarSectionInfo[];
  readonly registerSection: Func<DevToolbarSectionInfo, Unsubscribe>;
}
