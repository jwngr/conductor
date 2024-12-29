import {prefixErrorResult} from '@shared/lib/errorUtils.shared';
import {parseZodResult} from '@shared/lib/parser.shared';

import type {Result} from '@shared/types/result.types';
import {makeSuccessResult} from '@shared/types/result.types';
import type {SystemTag, SystemTagId, UserTag, UserTagId} from '@shared/types/tags.types';
import {
  SystemTagIdSchema,
  SystemTagSchema,
  TagType,
  UserTagIdSchema,
  UserTagSchema,
} from '@shared/types/tags.types';

/**
 * Parses a {@link UserTagId} from a plain string. Returns an `ErrorResult` if the string is not
 * valid.
 */
export function parseUserTagId(maybeUserTagId: string): Result<UserTagId> {
  const parsedTagIdResult = parseZodResult(UserTagIdSchema, maybeUserTagId);
  if (!parsedTagIdResult.success) {
    return prefixErrorResult(parsedTagIdResult, 'Invalid user tag ID');
  }
  return makeSuccessResult(parsedTagIdResult.value as UserTagId);
}

/**
 * Parses a {@link UserTag} from an unknown value. Returns an `ErrorResult` if the value is not
 * valid.
 */
export function parseUserTag(maybeUserTag: unknown): Result<UserTag> {
  const parsedTagResult = parseZodResult(UserTagSchema, maybeUserTag);
  if (!parsedTagResult.success) {
    return prefixErrorResult(parsedTagResult, 'Invalid user tag');
  }
  const parsedTagIdResult = parseUserTagId(parsedTagResult.value.tagId);
  if (!parsedTagIdResult.success) return parsedTagIdResult;

  const {name, createdTime, lastUpdatedTime} = parsedTagResult.value;
  return makeSuccessResult({
    tagId: parsedTagIdResult.value,
    type: TagType.User,
    name,
    createdTime: createdTime.toDate(),
    lastUpdatedTime: lastUpdatedTime.toDate(),
  });
}

/**
 * Parses a {@link SystemTagId} from a plain string. Returns an `ErrorResult` if the string is not
 * valid.
 */
export function parseSystemTagId(maybeSystemTagId: string): Result<SystemTagId> {
  const parsedTagIdResult = parseZodResult(SystemTagIdSchema, maybeSystemTagId);
  if (!parsedTagIdResult.success) {
    return prefixErrorResult(parsedTagIdResult, 'Invalid system tag ID');
  }
  return makeSuccessResult(parsedTagIdResult.value as SystemTagId);
}

/**
 * Parses a {@link SystemTag} from an unknown value. Returns an `ErrorResult` if the value is not
 * valid.
 */
export function parseSystemTag(maybeSystemTag: unknown): Result<SystemTag> {
  const parsedTagResult = parseZodResult(SystemTagSchema, maybeSystemTag);
  if (!parsedTagResult.success) {
    return prefixErrorResult(parsedTagResult, 'Invalid system tag');
  }
  const tagIdResult = parseSystemTagId(parsedTagResult.value.tagId);
  if (!tagIdResult.success) return tagIdResult;

  const {name} = parsedTagResult.value;
  return makeSuccessResult({
    tagId: tagIdResult.value,
    type: TagType.System,
    name,
  });
}
