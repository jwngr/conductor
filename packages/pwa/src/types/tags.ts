export type TagId = string;

export enum TagType {
  User = 'USER',
  Unread = 'UNREAD',
  Starred = 'STARRED',
  Archived = 'ARCHIVED', // TODO: Should this be Inbox instead?
}

export interface Tag {
  readonly tagId: TagId;
  readonly type: TagType;
  readonly name: string;
  readonly color: string; // TODO: Should this be optional?
}

export const UNREAD_TAG: Tag = {
  tagId: 'UNREAD',
  type: TagType.Unread,
  name: 'Unread',
  color: '#FFFFFF',
};

export const STARRED_TAG: Tag = {
  tagId: 'STARRED',
  type: TagType.Starred,
  name: 'Starred',
  color: '#FFD700',
};

export const ARCHIVED_TAG: Tag = {
  tagId: 'ARCHIVED',
  type: TagType.Archived,
  name: 'Archived',
  color: '#808080',
};
