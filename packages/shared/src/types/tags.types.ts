import {z} from 'zod';

import {parseZodResult, prefixErrorResult} from '@shared/lib/errorUtils.shared';
import {makeId} from '@shared/lib/utils.shared';

import type {Result} from '@shared/types/result.types';
import {makeSuccessResult} from '@shared/types/result.types';

export enum TagType {
  User = 'USER',
  System = 'SYSTEM',
}

/**
 * Strongly-typed type for a user tag's unique identifier. Prefer this over plain strings.
 */
export type UserTagId = string & {readonly __brand: 'UserTagIdBrand'};

export const UserTagIdSchema = z.string().uuid();

/**
 * Creates a `UserTagId` from a plain string. Returns an error if the string is not a valid
 * `UserTagId`.
 */
export function parseUserTagId(maybeUserTagId: string = makeId()): Result<UserTagId> {
  const parsedResult = parseZodResult(UserTagIdSchema, maybeUserTagId);
  if (!parsedResult.success) {
    return prefixErrorResult(parsedResult, 'Invalid user tag ID');
  }
  return makeSuccessResult(parsedResult.value as UserTagId);
}

/**
 * Creates a new random `UserTagId`.
 */
export function makeUserTagId(): UserTagId {
  return makeId() as UserTagId;
}

const UserTagSchema = z.object({
  tagId: UserTagIdSchema,
  name: z.string(),
});

export function parseUserTag(maybeUserTag: unknown): Result<UserTag> {
  const parsedResult = parseZodResult(UserTagSchema, maybeUserTag);
  if (!parsedResult.success) {
    return prefixErrorResult(parsedResult, 'Invalid user tag');
  }
  const tagIdResult = parseUserTagId(parsedResult.value.tagId);
  if (!tagIdResult.success) return tagIdResult;

  const {name} = parsedResult.value;
  return makeSuccessResult({
    tagId: tagIdResult.value,
    type: TagType.User,
    name,
  });
}

export enum SystemTagId {
  Unread = 'UNREAD',
  Starred = 'STARRED',
  Trashed = 'TRASHED',
  Importing = 'IMPORTING',
  // TODO: Consider implementing triage status as tags.
  // Untriaged = 'UNTRIAGED',
  // Done = 'DONE',
}

export const SystemTagIdSchema = z.nativeEnum(SystemTagId);

/**
 * Creates a `SystemTagId` from a plain string. Returns an error if the string is not a valid
 * `SystemTagId`.
 */
export function parseSystemTagId(maybeSystemTagId: string = makeId()): Result<SystemTagId> {
  const parsedResult = parseZodResult(SystemTagIdSchema, maybeSystemTagId);
  if (!parsedResult.success) {
    return prefixErrorResult(parsedResult, 'Invalid system tag ID');
  }
  return makeSuccessResult(parsedResult.value as SystemTagId);
}

/**
 * Creates a new random `SystemTagId`.
 */
export function makeSystemTagId(): SystemTagId {
  return makeId() as SystemTagId;
}

const SystemTagSchema = z.object({
  tagId: SystemTagIdSchema,
  name: z.string(),
});

export function parseSystemTag(maybeSystemTag: unknown): Result<SystemTag> {
  const parsedResult = parseZodResult(SystemTagSchema, maybeSystemTag);
  if (!parsedResult.success) {
    return prefixErrorResult(parsedResult, 'Invalid system tag');
  }
  const tagIdResult = parseSystemTagId(parsedResult.value.tagId);
  if (!tagIdResult.success) return tagIdResult;

  const {name} = parsedResult.value;
  return makeSuccessResult({
    tagId: tagIdResult.value,
    type: TagType.System,
    name,
  });
}

export type TagId = UserTagId | SystemTagId;

export interface Tag {
  readonly tagId: TagId;
  readonly type: TagType;
  readonly name: string;
  // TODO: Add color.
}

export interface UserTag extends Tag {
  readonly type: TagType.User;
  readonly tagId: UserTagId;
}

export interface SystemTag extends Tag {
  readonly type: TagType.System;
  readonly tagId: SystemTagId;
}

export class Tags {
  static readonly UNREAD_TAG: Tag = {
    tagId: SystemTagId.Unread,
    type: TagType.System,
    name: 'Unread',
  };

  static readonly STARRED_TAG: Tag = {
    tagId: SystemTagId.Starred,
    type: TagType.System,
    name: 'Starred',
  };

  static readonly TRASHED_TAG: Tag = {
    tagId: SystemTagId.Trashed,
    type: TagType.System,
    name: 'Trashed',
  };

  static readonly IMPORTING_TAG: Tag = {
    tagId: SystemTagId.Importing,
    type: TagType.System,
    name: 'Importing',
  };

  static makeUserTag(tagInfo: Omit<UserTag, 'type'>): UserTag {
    return {
      tagId: makeUserTagId(),
      type: TagType.User,
      name: tagInfo.name,
    };
  }
}
