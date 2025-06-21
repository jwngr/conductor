import {makeUuid} from '@shared/lib/utils.shared';

import type {UserTagId} from '@shared/types/ids.types';
import type {SystemTag, UserTag} from '@shared/types/tags.types';
import {SystemTagId, TagType} from '@shared/types/tags.types';

export function makeUserTagId(): UserTagId {
  return makeUuid<UserTagId>();
}

export function makeUserTag(tagInfo: Omit<UserTag, 'tagId' | 'tagType'>): UserTag {
  return {
    tagId: makeUserTagId(),
    tagType: TagType.User,
    name: tagInfo.name,
    createdTime: tagInfo.createdTime,
    lastUpdatedTime: tagInfo.lastUpdatedTime,
  };
}

export function makeSystemTag(tagInfo: Omit<SystemTag, 'tagType'>): SystemTag {
  return {
    tagId: tagInfo.tagId,
    tagType: TagType.System,
    name: tagInfo.name,
  };
}

export const UNREAD_TAG: SystemTag = makeSystemTag({
  tagId: SystemTagId.Unread,
  name: 'Unread',
});

export const STARRED_TAG: SystemTag = makeSystemTag({
  tagId: SystemTagId.Starred,
  name: 'Starred',
});

export const TRASHED_TAG: SystemTag = makeSystemTag({
  tagId: SystemTagId.Trashed,
  name: 'Trashed',
});
