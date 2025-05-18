import {z} from 'zod';

/**
 * A schema that accepts any valid Firestore timestamp type:
 * - Firestore Timestamp objects (with toDate())
 * - JavaScript Date objects
 * - Server timestamps (FieldValue with _methodName)
 */
export const FirestoreTimestampSchema = z.union([
  z.instanceof(Date),
  // Allow Firestore Timestamps (which have toDate())
  z.object({toDate: z.function()}).passthrough(),
  // Allow server timestamps.
  z.object({_methodName: z.string()}).passthrough(),
]);

export type FirestoreTimestamp = z.infer<typeof FirestoreTimestampSchema>;
