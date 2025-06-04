import {prefixErrorResult} from '@shared/lib/errorUtils.shared';
import {parseZodResult} from '@shared/lib/parser.shared';

import type {Actor} from '@shared/types/actors.types';
import type {Result} from '@shared/types/results.types';

import {ActorSchema} from '@shared/schemas/actors.schema';
import {fromStorageActor} from '@shared/storage/actor.storage';

/**
 * Attempts to parse an unknown value into an {@link Actor}.
 */
export function parseActor(maybeActor: unknown): Result<Actor> {
  const parsedResult = parseZodResult(ActorSchema, maybeActor);
  if (!parsedResult.success) return prefixErrorResult(parsedResult, 'Invalid actor');

  const actorFromStorage = parsedResult.value;
  return fromStorageActor(actorFromStorage);
}
