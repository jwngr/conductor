import {logger} from '@shared/services/logger.shared';

import {makeUserActor} from '@shared/lib/actors.shared';
import {prefixErrorResult} from '@shared/lib/errorUtils.shared';
import {parseZodResult} from '@shared/lib/parser.shared';
import {makeErrorResult, makeSuccessResult} from '@shared/lib/results.shared';

import {parseAccountId} from '@shared/parsers/accounts.parser';

import type {Actor, SystemActor, UserActor} from '@shared/types/actors.types';
import {ActorType} from '@shared/types/actors.types';
import type {Result} from '@shared/types/results.types';

import {ActorSchema, SystemActorSchema, UserActorSchema} from '@shared/schemas/actors.schema';

function parseUserActor(actor: unknown): Result<UserActor> {
  const parsedUserActorResult = parseZodResult(UserActorSchema, actor);
  if (!parsedUserActorResult.success) {
    return makeErrorResult(new Error('Failed to parse user actor'));
  }
  const parsedUserActor = parsedUserActorResult.value;

  const accountIdResult = parseAccountId(parsedUserActor.accountId);
  if (!accountIdResult.success) {
    return prefixErrorResult(accountIdResult, 'Failed to parse user actor account ID');
  }
  return makeSuccessResult(makeUserActor(accountIdResult.value));
}

function parseSystemActor(actor: unknown): Result<SystemActor> {
  const parsedSystemActorResult = parseZodResult(SystemActorSchema, actor);
  if (!parsedSystemActorResult.success) {
    return makeErrorResult(new Error('Failed to parse system actor'));
  }
  return makeSuccessResult(parsedSystemActorResult.value);
}

export function parseActor(maybeActor: unknown): Result<Actor> {
  const parsedActorResult = parseZodResult(ActorSchema, maybeActor);
  if (!parsedActorResult.success) return prefixErrorResult(parsedActorResult, 'Invalid actor');
  const parsedActor = parsedActorResult.value;

  switch (parsedActor.actorType) {
    case ActorType.User:
      return parseUserActor(maybeActor);
    case ActorType.System:
      return parseSystemActor(maybeActor);
    default: {
      const error = new Error('Parsed actor has unexpected actor type');
      logger.error(error, {maybeActor});
      return makeErrorResult(error);
    }
  }
}
