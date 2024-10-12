import {FieldValue} from 'firebase/firestore';

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

export interface FeedItem {
  readonly itemId: FeedItemId;
  readonly source: string; // TODO: Make enum (e.g. extension vs email).

  // Content metadata.
  readonly url: string;
  readonly title: string;
  readonly description: string;
  readonly outgoingLinks: string[];

  // State.
  readonly isRead: boolean;
  readonly isDone: boolean;
  readonly isSaved: boolean;

  // Import status.
  readonly isImporting: boolean;
  readonly lastImportedTime?: FieldValue;

  // Timestamps.
  readonly createdTime: FieldValue;
  readonly lastUpdatedTime: FieldValue;
}

export interface StyleAttributes {
  readonly style?: React.CSSProperties;
  readonly className?: string;
}