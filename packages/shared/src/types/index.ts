export interface ImportQueueItem {
  readonly url: string;
  readonly timestamp: number;
  readonly createdAt: number;
  readonly lastUpdatedAt: number;
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

export interface SavedItem {
  readonly url: string;
  // readonly title: string;
  // readonly description: string;
  readonly isSaved: boolean;
  readonly source: string; // TODO: Make enum.
  readonly savedAt: number;
  readonly createdAt: number;
  readonly lastUpdatedAt: number;
}
