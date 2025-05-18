import {z} from 'zod';

import {AccountIdSchema} from '@shared/types/accounts.types';
import {ActorType} from '@shared/types/actors.types';

export const UserActorSchema = z.object({
  actorType: z.literal(ActorType.User),
  accountId: AccountIdSchema,
});

export const SystemActorSchema = z.object({
  actorType: z.literal(ActorType.System),
});

export const ActorSchema = z.union([UserActorSchema, SystemActorSchema]);
