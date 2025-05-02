import {syncTry} from '@shared/lib/errorUtils.shared';
import {assertNever} from '@shared/lib/utils.shared';

import type {FeedItemId} from '@shared/types/feedItems.types';
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

  static forFeedItemRoot(): string {
    return '/items';
  }

  static forFeedItem(feedItemId: FeedItemId): string {
    return `${this.forFeedItemRoot()}/${feedItemId}`;
  }

  static forFeedItemUnsafe(maybeFeedItemId: string): string {
    return `${this.forFeedItemRoot()}/${maybeFeedItemId}`;
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

  static forStories(): string {
    return '/ui';
  }
}
