import type {BaseStoreItem} from '@shared/types/utils.types';

export enum TagType {
  /** A tag whose lifecycle is managed by the user. */
  User = 'USER',
  /** A tag whose lifecycle is managed by the system. */
  System = 'SYSTEM',
}

/**
 * Strongly-typed type for a {@link UserTag}'s unique identifier. Prefer this over plain strings.
 */
export type UserTagId = string & {readonly __brand: 'UserTagIdBrand'};

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

export type TagId = UserTagId | SystemTagId;

/**
 * An arbitrary string which is either present or not for each {@link FeedItem}. Tags can have
 * associated metadata, such as a color and icon. They can also be used as filter criteria for
 * views and searches.
 */
interface BaseTag {
  readonly tagId: TagId;
  readonly tagType: TagType;
  readonly name: string;
  // TODO: Add color.
}

/**
 * A tag whose lifecycle is managed by the user.
 */
export interface UserTag extends BaseTag, BaseStoreItem {
  readonly tagType: TagType.User;
  readonly tagId: UserTagId;
}

/**
 * A tag whose lifecycle is managed by the system.
 */
export interface SystemTag extends BaseTag {
  readonly tagType: TagType.System;
  readonly tagId: SystemTagId;
}
