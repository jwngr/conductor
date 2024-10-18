import {FieldValue} from 'firebase/firestore';

import {IconName} from './icons';
import {TagId} from './tags';

export interface ImportQueueItem {
  readonly url: string;
  readonly feedItemId: string;
  readonly createdTime: FieldValue;
  readonly lastUpdatedTime: FieldValue;
}

export interface FirebaseConfig {
  readonly apiKey: string;
  readonly authDomain: string;
  readonly projectId: string;
  readonly storageBucket: string;
  readonly messagingSenderId: string;
  readonly appId: string;
  readonly measurementId?: string;
}

export type FeedItemId = string;

export function isFeedItemId(feedItemId: string | undefined): feedItemId is FeedItemId {
  return typeof feedItemId === 'string' && feedItemId.length > 0;
}

export enum TriageStatus {
  Untriaged = 'UNTRIAGED',
  Saved = 'SAVED',
  Done = 'DONE',
  Trashed = 'TRASHED',
}

export interface FeedItem {
  readonly itemId: FeedItemId;
  readonly source: string; // TODO: Make enum (e.g. extension vs email).

  // Content metadata.
  readonly url: string;
  readonly title: string;
  readonly description: string;
  /** Links found in the scraped URL content. */
  readonly outgoingLinks: string[];

  /**
   * Triage status determines where the feed item "lives" in the app.
   *
   * Unlike tags which represent boolean states, these statuses form an exclusive set.
   */
  readonly triageStatus: TriageStatus;

  /**
   * Feed item state needs to allow for:
   * - quick reads and writes.
   * - indexing of arbitrary boolean user states.
   *
   * To accomplish this, most state is stored as tags that either exist in this map or not.
   *
   * Note: FieldValue is used to delete tags.
   * TODO: Consider abstracting this strange type way with a Firestore converter.
   * See https://cloud.google.com/firestore/docs/manage-data/add-data#custom_objects.
   */
  readonly tagIds: Record<TagId, true | FieldValue>;

  // Timestamps.
  readonly createdTime: FieldValue;
  readonly lastUpdatedTime: FieldValue;
  readonly lastImportedTime?: FieldValue;
}

export enum FeedItemActionType {
  MarkDone = 'MARK_DONE',
  MarkUnread = 'MARK_UNREAD',
  Save = 'SAVE',
  Star = 'STAR',
}

export interface FeedItemAction {
  readonly type: FeedItemActionType;
  readonly text: string;
  readonly icon: IconName;
  // TODO: Add keyboard shortcuts.
  // readonly shortcut: ShortcutId;
}

export interface StyleAttributes {
  readonly style?: React.CSSProperties;
  readonly className?: string;
}
