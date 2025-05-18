import {z} from 'zod';

/**
 * A schema that accepts any valid Firestore timestamp type:
 * - Firestore Timestamp objects (with toDate())
 * - JavaScript Date objects
 * - Server timestamps (FieldValue with _methodName)
 */
export const FirestoreTimestampSchema = z.any().refine(
  (val) => {
    // Allow Date objects
    if (val instanceof Date) return true;
    // Allow Firestore Timestamps (which have toDate())
    if (val && typeof val === 'object' && 'toDate' in val) return true;
    // Allow server timestamps
    if (val && typeof val === 'object' && '_methodName' in val) return true;
    return false;
  },
  {message: 'Invalid timestamp value'}
);

export type FirestoreTimestamp = z.infer<typeof FirestoreTimestampSchema>;
