import {FieldValue} from 'firebase/firestore';

export interface ImportQueueItem {
  readonly url: string;
  readonly itemId: string; // Index into `/items` collection.
  readonly createdAt: FieldValue;
  readonly lastUpdatedAt: FieldValue;
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

export type SavedItemId = string;

export interface SavedItem {
  readonly id: SavedItemId;
  readonly url: string;
  // readonly title: string;
  // readonly description: string;
  readonly isSaved: boolean;
  readonly source: string; // TODO: Make enum.

  // Import status.
  readonly isImporting: boolean;
  readonly lastImportedAt?: FieldValue;

  // Timestamps.
  readonly createdAt: FieldValue;
  readonly lastUpdatedAt: FieldValue;
}

export type Task<T = void> = () => T;
export type AsyncTask<T = void> = () => Promise<T>;
export type Func<T> = (args: T) => void;
