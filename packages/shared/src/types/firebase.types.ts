import {Timestamp} from 'firebase/firestore';
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

// export const FirestoreTimestampSchema = z.object({
//   seconds: z.number(),
//   nanoseconds: z.number(),
//   toDate: z.function().args().returns(z.date()),
// });

export const FirestoreTimestampSchema = z.custom<Timestamp>((value) => value instanceof Timestamp);
