import {z} from 'zod';

import {ActorType} from '@shared/types/actors.types';

import {AccountIdSchema} from '@shared/schemas/accounts.schema';

const UserActorSchema = z.object({
  actorType: z.literal(ActorType.User),
  accountId: AccountIdSchema,
});

type UserActorFromStorage = z.infer<typeof UserActorSchema>;

const SystemActorSchema = z.object({
  actorType: z.literal(ActorType.System),
});

type SystemActorFromStorage = z.infer<typeof SystemActorSchema>;

export const ActorSchema = z.discriminatedUnion('actorType', [UserActorSchema, SystemActorSchema]);

export type ActorFromStorage = UserActorFromStorage | SystemActorFromStorage;
