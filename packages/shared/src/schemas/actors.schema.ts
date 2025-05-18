import {z} from 'zod';

import {ActorType} from '@shared/types/actors.types';

import {AccountIdSchema} from '@shared/schemas/accounts.schema';

export const UserActorSchema = z.object({
  actorType: z.literal(ActorType.User),
  accountId: AccountIdSchema,
});

export const SystemActorSchema = z.object({
  actorType: z.literal(ActorType.System),
});

export const ActorSchema = z.union([UserActorSchema, SystemActorSchema]);
