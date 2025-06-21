import type {UserTagId} from '@shared/types/ids.types';
import type {BaseStoreItem} from '@shared/types/utils.types';

export enum TagType {
  /** A tag whose lifecycle is managed by the end user. */
  User = 'USER',
  /** A tag whose lifecycle is managed by the system. */
  System = 'SYSTEM',
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
 * A tag whose lifecycle is managed by the end user.
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
