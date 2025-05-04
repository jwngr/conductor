import {z} from 'zod';

import {makeUuid} from '@shared/lib/utils.shared';

import {FirestoreTimestampSchema} from '@shared/types/firebase.types';
import type {BaseStoreItem} from '@shared/types/utils.types';

export enum TagType {
  User = 'USER',
  System = 'SYSTEM',
}

/**
 * Strongly-typed type for a {@link UserTag}'s unique identifier. Prefer this over plain strings.
 */
export type UserTagId = string & {readonly __brand: 'UserTagIdBrand'};

/**
 * Zod schema for a {@link UserTagId}.
 */
export const UserTagIdSchema = z.string().uuid();

/**
 * Creates a new random {@link UserTagId}.
 */
export function makeUserTagId(): UserTagId {
  return makeUuid<UserTagId>();
}

/**
 * Unique IDs for {@link SystemTag}s, which are tags whose lifecycle is managed by the system.
 */
export enum SystemTagId {
  Unread = 'UNREAD',
  Starred = 'STARRED',
  Trashed = 'TRASHED',
  Importing = 'IMPORTING',
  // TODO: Consider implementing triage status as tags.
  // Untriaged = 'UNTRIAGED',
  // Done = 'DONE',
}

/**
 * Zod schema for a {@link SystemTagId}.
 */
export const SystemTagIdSchema = z.nativeEnum(SystemTagId);

export type TagId = UserTagId | SystemTagId;

/**
 * An arbitrary string which is either present or not for each {@link FeedItem}. Tags can have
 * associated metadata, such as a color and icon. They can also be used as filter criteria for
 * views and searches.
 */
export interface Tag {
  readonly tagId: TagId;
  readonly type: TagType;
  readonly name: string;
  // TODO: Add color.
}

/**
 * A tag whose lifecycle is managed by the user.
 */
export interface UserTag extends Tag, BaseStoreItem {
  readonly type: TagType.User;
  readonly tagId: UserTagId;
}

/**
 * Zod schema for a {@link UserTag}.
 */
export const UserTagSchema = z.object({
  tagId: UserTagIdSchema,
  name: z.string().min(1).max(255),
  createdTime: FirestoreTimestampSchema.or(z.date()),
  lastUpdatedTime: FirestoreTimestampSchema.or(z.date()),
});

/**
 * A tag whose lifecycle is managed by the system.
 */
export interface SystemTag extends Tag {
  readonly type: TagType.System;
  readonly tagId: SystemTagId;
}

export const SystemTagSchema = z.object({
  tagId: SystemTagIdSchema,
  name: z.string().min(1).max(255),
});

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

  static makeUserTag(tagInfo: Omit<UserTag, 'tagId' | 'type'>): UserTag {
    return {
      tagId: makeUserTagId(),
      type: TagType.User,
      name: tagInfo.name,
      createdTime: tagInfo.createdTime,
      lastUpdatedTime: tagInfo.lastUpdatedTime,
    };
  }
}
