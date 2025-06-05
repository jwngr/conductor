import {z} from 'zod';

import {SystemTagId} from '@shared/types/tags.types';

import {FirestoreTimestampSchema} from '@shared/schemas/firebase.schema';

export const UserTagIdSchema = z.string().uuid();

export const SystemTagIdSchema = z.nativeEnum(SystemTagId);

export const UserTagSchema = z.object({
  tagId: UserTagIdSchema,
  name: z.string().min(1).max(255),
  createdTime: FirestoreTimestampSchema.or(z.date()),
  lastUpdatedTime: FirestoreTimestampSchema.or(z.date()),
});

export const SystemTagSchema = z.object({
  tagId: SystemTagIdSchema,
  name: z.string().min(1).max(255),
});
