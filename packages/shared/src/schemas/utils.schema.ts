import {z} from 'zod/v4';

import {FirestoreTimestampSchema} from '@shared/schemas/firebase.schema';

export const BaseStoreItemSchema = z.object({
  createdTime: FirestoreTimestampSchema.or(z.date()),
  lastUpdatedTime: FirestoreTimestampSchema.or(z.date()),
});
