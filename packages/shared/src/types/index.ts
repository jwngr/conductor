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
