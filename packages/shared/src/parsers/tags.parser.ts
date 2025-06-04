import {prefixErrorResult} from '@shared/lib/errorUtils.shared';
import {parseStorageTimestamp, parseZodResult} from '@shared/lib/parser.shared';
import {makeSuccessResult} from '@shared/lib/results.shared';

import type {Result} from '@shared/types/results.types';
import type {SystemTag, SystemTagId, UserTag, UserTagId} from '@shared/types/tags.types';
import {TagType} from '@shared/types/tags.types';

import {
  SystemTagIdSchema,
  SystemTagSchema,
  UserTagIdSchema,
  UserTagSchema,
} from '@shared/schemas/tags.schema';

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
    tagType: TagType.User,
    name,
    createdTime: parseStorageTimestamp(createdTime),
    lastUpdatedTime: parseStorageTimestamp(lastUpdatedTime),
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

  return makeSuccessResult({
    tagId: tagIdResult.value,
    tagType: TagType.System,
    name: parsedTagResult.value.name,
  });
}
