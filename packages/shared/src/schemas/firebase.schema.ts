import {z} from 'zod/v4';

/**
 * A schema that accepts any valid Firestore timestamp type:
 * - Firestore Timestamp objects (with toDate())
 * - JavaScript Date objects
 * - Server timestamps (FieldValue with _methodName)
 */
export const FirestoreTimestampSchema = z.any().refine(
  (val) => {
    // Timestamps created locally are initialized to null.
    if (val === null) return true;
    // Allow Date objects.
    if (val instanceof Date) return true;
    // Allow Firestore timestamps (which have toDate()).
    if (val && typeof val === 'object' && 'toDate' in val) return true;
    // Allow server timestamps.
    if (val && typeof val === 'object' && '_methodName' in val) return true;
    return false;
  },
  {message: 'Invalid timestamp value'}
);

export const FirebaseConfigSchema = z.object({
  apiKey: z.string(),
  authDomain: z.string(),
  projectId: z.string(),
  storageBucket: z.string(),
  messagingSenderId: z.string(),
  appId: z.string(),
  measurementId: z.string().optional(),
});

export type FirestoreTimestamp = z.infer<typeof FirestoreTimestampSchema>;
