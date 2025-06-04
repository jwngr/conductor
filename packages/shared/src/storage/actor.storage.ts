import {makeUserActor, SYSTEM_ACTOR} from '@shared/lib/actors.shared';
import {makeSuccessResult} from '@shared/lib/results.shared';
import {assertNever} from '@shared/lib/utils.shared';

import {parseAccountId} from '@shared/parsers/accounts.parser';

import type {Actor} from '@shared/types/actors.types';
import {ActorType} from '@shared/types/actors.types';
import type {Result} from '@shared/types/results.types';

import type {ActorFromStorage} from '@shared/schemas/actors.schema';

/**
 * Converts an {@link ActorFromStorage} into an {@link Actor}.
 */
export function fromStorageActor(actorFromStorage: ActorFromStorage): Result<Actor> {
  switch (actorFromStorage.actorType) {
    case ActorType.User: {
      const accountIdResult = parseAccountId(actorFromStorage.accountId);
      if (!accountIdResult.success) return accountIdResult;
      return makeSuccessResult(makeUserActor(accountIdResult.value));
    }
    case ActorType.System:
      return makeSuccessResult(SYSTEM_ACTOR);
    default:
      assertNever(actorFromStorage);
  }
}

/**
 * Converts an {@link Actor} into an {@link ActorFromStorage}.
 */
export function toStorageActor(actor: Actor): ActorFromStorage {
  switch (actor.actorType) {
    case ActorType.User:
      return {
        actorType: actor.actorType,
        accountId: actor.accountId,
      };
    case ActorType.System:
      return SYSTEM_ACTOR;
    default:
      assertNever(actor);
  }
}
