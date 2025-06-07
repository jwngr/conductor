import {z} from 'zod';

import {SystemTagId} from '@shared/types/tags.types';

import {BaseStoreItemSchema} from '@shared/schemas/utils.schema';

export const UserTagIdSchema = z.string().uuid();

export const SystemTagIdSchema = z.nativeEnum(SystemTagId);

export const UserTagSchema = BaseStoreItemSchema.extend({
  tagId: UserTagIdSchema,
  name: z.string().min(1).max(255),
});

export const SystemTagSchema = z.object({
  tagId: SystemTagIdSchema,
  name: z.string().min(1).max(255),
});
