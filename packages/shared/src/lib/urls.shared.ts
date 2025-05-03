import {syncTry} from '@shared/lib/errorUtils.shared';
import {assertNever} from '@shared/lib/utils.shared';

import type {FeedItemId} from '@shared/types/feedItems.types';
import type {StoriesSidebarItem} from '@shared/types/stories.types';
import {ViewType} from '@shared/types/views.types';

// TODO: Make URL validation more robust.
export function isValidUrl(url: string): boolean {
  const isValidUrlResult1 = syncTry(() => new URL(url));
  if (isValidUrlResult1.success) return true;

  const isValidUrlResult2 = syncTry(() => new URL('https://' + url));
  return isValidUrlResult2.success;
}

export class Urls {
  static forRoot(): string {
    return '/';
  }

  static forView(viewType: ViewType): string {
    switch (viewType) {
      case ViewType.Untriaged:
        return this.forRoot();
      case ViewType.Saved:
        return '/saved';
      case ViewType.Done:
        return '/done';
      case ViewType.Trashed:
        return '/trashed';
      case ViewType.Unread:
        return '/unread';
      case ViewType.Starred:
        return '/starred';
      case ViewType.All:
        return '/all';
      case ViewType.Today:
        return '/today';
      default:
        assertNever(viewType);
    }
  }

  static forFeedItem(feedItemId: FeedItemId): string {
    return `items/${feedItemId}`;
  }

  static forFeedSubscriptions(): string {
    return '/feeds';
  }

  static forImport(): string {
    return '/import';
  }

  static forSignIn(): string {
    return '/login';
  }

  static forSignOut(): string {
    return '/logout';
  }

  static forStories(item?: StoriesSidebarItem): string {
    if (!item) {
      return '/ui';
    }

    return `/ui/${item.sidebarSectionId}/${item.sidebarItemId}`;
  }
}
