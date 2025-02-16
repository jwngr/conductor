import {logger} from '@shared/services/logger.shared';

import {prefixResultIfError} from '@shared/lib/errorUtils.shared';

import {parseAccountId} from '@shared/parsers/accounts.parser';

import type {Actor} from '@shared/types/actors.types';
import {ActorSchema, ActorType, makeUserActor, SYSTEM_ACTOR} from '@shared/types/actors.types';
import {makeErrorResult, makeSuccessResult} from '@shared/types/result.types';
import type {Result} from '@shared/types/result.types';

export function parseActor(actor: unknown): Result<Actor> {
  const result = ActorSchema.safeParse(actor);
  if (!result.success) {
    return makeErrorResult(new Error('Failed to parse actor'));
  }
  switch (result.data.type) {
    case ActorType.User: {
      const accountIdResult = parseAccountId(result.data.accountId);
      if (!accountIdResult.success) {
        return prefixResultIfError(accountIdResult, 'Failed to parse user actor account ID');
      }
      return makeSuccessResult(makeUserActor(accountIdResult.value));
    }
    case ActorType.System:
      return makeSuccessResult(SYSTEM_ACTOR);
    default: {
      const error = new Error('Parsed actor has unexpected actor type');
      logger.error(error, {actor});
      return makeErrorResult(error);
    }
  }
}
