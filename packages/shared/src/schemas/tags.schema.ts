import {z} from 'zod';

import {SystemTagId} from '@shared/types/tags.types';

import {FirestoreTimestampSchema} from '@shared/schemas/firebase.schema';

/** Zod schema for a {@link UserTagId}. */
export const UserTagIdSchema = z.string().uuid();

/** Zod schema for a {@link SystemTagId}. */
export const SystemTagIdSchema = z.nativeEnum(SystemTagId);

/** Zod schema for a {@link UserTag}. */
export const UserTagSchema = z.object({
  tagId: UserTagIdSchema,
  name: z.string().min(1).max(255),
  createdTime: FirestoreTimestampSchema.or(z.date()),
  lastUpdatedTime: FirestoreTimestampSchema.or(z.date()),
});

/** Zod schema for a {@link SystemTag}. */
export const SystemTagSchema = z.object({
  tagId: SystemTagIdSchema,
  name: z.string().min(1).max(255),
});
