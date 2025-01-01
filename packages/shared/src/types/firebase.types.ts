import {z} from 'zod';

export interface FirebaseConfig {
  readonly apiKey: string;
  readonly authDomain: string;
  readonly projectId: string;
  readonly storageBucket: string;
  readonly messagingSenderId: string;
  readonly appId: string;
  readonly measurementId?: string;
}

export const FirestoreTimestampSchema = z.object({
  seconds: z.number(),
  nanoseconds: z.number(),
  toDate: z.function().args().returns(z.date()),
  toMillis: z.function().args().returns(z.number()),
});

export type FirestoreTimestamp = z.infer<typeof FirestoreTimestampSchema>;
