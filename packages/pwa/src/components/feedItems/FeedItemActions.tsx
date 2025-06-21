import type React from 'react';
import {useCallback} from 'react';

import {SharedFeedItemHelpers} from '@shared/lib/feedItems.shared';
import {makeSuccessResult} from '@shared/lib/results.shared';

import {FeedItemImportStatus} from '@shared/types/feedItemImportStates';
import type {FeedItem} from '@shared/types/feedItems.types';
import type {IconName} from '@shared/types/icons.types';
import type {AsyncResult} from '@shared/types/results.types';
import type {KeyboardShortcutId} from '@shared/types/shortcuts.types';
import type {Supplier} from '@shared/types/utils.types';

import {useFeedItemsService} from '@sharedClient/hooks/feedItems.hooks';

import type {MouseEvent} from '@sharedClient/types/utils.client.types';

import {ButtonIcon} from '@src/components/atoms/ButtonIcon';
import {FlexRow} from '@src/components/atoms/Flex';

import {firebaseService} from '@src/lib/firebase.pwa';

interface GenericFeedItemActionIconProps {
  readonly icon: IconName;
  readonly tooltip: string;
  readonly shortcutId: KeyboardShortcutId | undefined;
  readonly performAction: Supplier<AsyncResult<void, Error>>;
  readonly disabled?: boolean;
}

const GenericFeedItemActionIcon: React.FC<GenericFeedItemActionIconProps> = ({
  icon,
  tooltip,
  shortcutId,
  performAction,
  disabled,
}) => {
  const handleAction = useCallback(
    async (event?: MouseEvent<HTMLDivElement>): AsyncResult<void, Error> => {
      if (disabled) return makeSuccessResult(undefined);

      event?.stopPropagation();
      event?.preventDefault();

      return await performAction();
    },
    [disabled, performAction]
  );

  return (
    <ButtonIcon
      name={icon}
      tooltip={tooltip}
      size={40}
      onClick={handleAction}
      shortcutId={shortcutId}
      disabled={disabled}
    />
  );
};

const MarkDoneFeedItemActionIcon: React.FC<{
  readonly feedItem: FeedItem;
}> = ({feedItem}) => {
  const actionInfo = SharedFeedItemHelpers.getMarkDoneFeedItemActionInfo(feedItem);
  const isDone = SharedFeedItemHelpers.isMarkedDone(feedItem);
  const feedItemsService = useFeedItemsService({firebaseService});

  return (
    <GenericFeedItemActionIcon
      icon={actionInfo.icon}
      tooltip={actionInfo.text}
      shortcutId={actionInfo.shortcutId}
      performAction={async () =>
        isDone
          ? await feedItemsService.markFeedItemAsUndone(feedItem.feedItemId)
          : await feedItemsService.markFeedItemAsDone(feedItem.feedItemId)
      }
    />
  );
};

const SaveFeedItemActionIcon: React.FC<{
  readonly feedItem: FeedItem;
}> = ({feedItem}) => {
  const actionInfo = SharedFeedItemHelpers.getSaveFeedItemActionInfo(feedItem);
  const isSaved = SharedFeedItemHelpers.isSaved(feedItem);
  const feedItemsService = useFeedItemsService({firebaseService});

  return (
    <GenericFeedItemActionIcon
      icon={actionInfo.icon}
      tooltip={actionInfo.text}
      shortcutId={actionInfo.shortcutId}
      performAction={async () =>
        isSaved
          ? await feedItemsService.unsaveFeedItem(feedItem.feedItemId)
          : await feedItemsService.saveFeedItem(feedItem.feedItemId)
      }
    />
  );
};

const MarkUnreadFeedItemActionIcon: React.FC<{
  readonly feedItem: FeedItem;
}> = ({feedItem}) => {
  const actionInfo = SharedFeedItemHelpers.getMarkUnreadFeedItemActionInfo(feedItem);
  const isUnread = SharedFeedItemHelpers.isUnread(feedItem);
  const feedItemsService = useFeedItemsService({firebaseService});

  return (
    <GenericFeedItemActionIcon
      icon={actionInfo.icon}
      tooltip={actionInfo.text}
      shortcutId={actionInfo.shortcutId}
      performAction={async () =>
        isUnread
          ? await feedItemsService.markFeedItemAsRead(feedItem.feedItemId)
          : await feedItemsService.markFeedItemAsUnread(feedItem.feedItemId)
      }
    />
  );
};

const StarFeedItemActionIcon: React.FC<{
  readonly feedItem: FeedItem;
}> = ({feedItem}) => {
  const actionInfo = SharedFeedItemHelpers.getStarFeedItemActionInfo(feedItem);
  const isStarred = SharedFeedItemHelpers.isStarred(feedItem);
  const feedItemsService = useFeedItemsService({firebaseService});

  return (
    <GenericFeedItemActionIcon
      icon={actionInfo.icon}
      tooltip={actionInfo.text}
      shortcutId={actionInfo.shortcutId}
      performAction={async () =>
        isStarred
          ? await feedItemsService.unstarFeedItem(feedItem.feedItemId)
          : await feedItemsService.starFeedItem(feedItem.feedItemId)
      }
    />
  );
};

const RetryImportActionIcon: React.FC<{
  readonly feedItem: FeedItem;
}> = ({feedItem}) => {
  const actionInfo = SharedFeedItemHelpers.getRetryImportFeedItemActionInfo();
  const feedItemsService = useFeedItemsService({firebaseService});

  return (
    <GenericFeedItemActionIcon
      icon={actionInfo.icon}
      tooltip={actionInfo.text}
      shortcutId={actionInfo.shortcutId}
      performAction={async () => await feedItemsService.retryImport(feedItem)}
      disabled={feedItem.importState.status === FeedItemImportStatus.Processing}
    />
  );
};

export const FeedItemActions: React.FC<{
  readonly feedItem: FeedItem;
}> = ({feedItem}) => {
  return (
    <FlexRow gap={3}>
      <RetryImportActionIcon feedItem={feedItem} />
      <StarFeedItemActionIcon feedItem={feedItem} />
      <MarkUnreadFeedItemActionIcon feedItem={feedItem} />
      <SaveFeedItemActionIcon feedItem={feedItem} />
      <MarkDoneFeedItemActionIcon feedItem={feedItem} />
    </FlexRow>
  );
};

export const HoverFeedItemActions: React.FC<{
  readonly feedItem: FeedItem;
}> = ({feedItem}) => {
  return (
    <FlexRow gap={3}>
      <StarFeedItemActionIcon feedItem={feedItem} />
      <MarkUnreadFeedItemActionIcon feedItem={feedItem} />
      <SaveFeedItemActionIcon feedItem={feedItem} />
      <MarkDoneFeedItemActionIcon feedItem={feedItem} />
    </FlexRow>
  );
};
