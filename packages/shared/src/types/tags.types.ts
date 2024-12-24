import {makeId} from '@shared/lib/utils';

import type {Result} from '@shared/types/result.types';
import {makeErrorResult, makeSuccessResult} from '@shared/types/result.types';

export enum TagType {
  User = 'USER',
  System = 'SYSTEM',
}

/**
 * Strongly-typed type for a user tag's unique identifier. Prefer this over plain strings.
 */
export type UserTagId = string & {readonly __brand: 'UserTagIdBrand'};

/**
 * Checks if a value is a valid `UserTagId`.
 */
export function isUserTagId(maybeUserTagId: unknown): maybeUserTagId is UserTagId {
  return typeof maybeUserTagId === 'string' && maybeUserTagId.length > 0;
}

/**
 * Creates a `UserTagId` from a plain string. Returns an error if the string is not a valid
 * `UserTagId`.
 */
export function makeUserTagId(maybeUserTagId: string = makeId()): Result<UserTagId> {
  if (!isUserTagId(maybeUserTagId)) {
    return makeErrorResult(new Error(`Invalid user tag ID: "${maybeUserTagId}"`));
  }
  return makeSuccessResult(maybeUserTagId);
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

export type TagId = UserTagId | SystemTagId;

export interface Tag {
  readonly tagId: TagId;
  readonly type: TagType;
  readonly name: string;
  // TODO: Add color.
}

export interface UserTag extends Tag {
  readonly type: TagType.User;
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
      ...tagInfo,
      type: TagType.User,
    };
  }
}
