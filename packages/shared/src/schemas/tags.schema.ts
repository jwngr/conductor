import {z} from 'zod/v4';

import {SystemTagId} from '@shared/types/tags.types';

import {BaseStoreItemSchema} from '@shared/schemas/utils.schema';

export const UserTagIdSchema = z.uuid();

export const SystemTagIdSchema = z.enum(SystemTagId);

export const UserTagSchema = BaseStoreItemSchema.extend({
  tagId: UserTagIdSchema,
  name: z.string().min(1).max(255),
});

export const SystemTagSchema = z.object({
  tagId: SystemTagIdSchema,
  name: z.string().min(1).max(255),
});
