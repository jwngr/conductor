import {PERSONAL_YOUTUBE_CHANNEL_ID} from '@shared/lib/constants.shared';
import {IMMEDIATE_DELIVERY_SCHEDULE} from '@shared/lib/deliverySchedules.shared';
import {makeCompletedFeedItemImportState} from '@shared/lib/feedItemImportStates.shared';
import {makeFeedItemId} from '@shared/lib/feedItems.shared';
import {
  ACTIVE_FEED_SUBSCRIPTION_LIFECYCLE_STATE,
  makeFeedSubscriptionId,
} from '@shared/lib/feedSubscriptions.shared';

import {FeedItemContentType} from '@shared/types/feedItemContent.types';
import {TriageStatus} from '@shared/types/feedItems.types';
import type {FeedItem, VideoFeedItem} from '@shared/types/feedItems.types';
import {FeedType} from '@shared/types/feeds.types';
import type {
  FeedSubscription,
  YouTubeChannelFeedSubscription,
} from '@shared/types/feedSubscriptions.types';
import type {AccountId} from '@shared/types/ids.types';
import {SystemTagId} from '@shared/types/tags.types';

interface MockFeedData {
  readonly feedSubscription: FeedSubscription;
  readonly feedItems: FeedItem[];
}

export const makeYouTubeJacobWengerMockFeedData = (args: {
  readonly accountId: AccountId;
}): MockFeedData => {
  const {accountId} = args;

  const feedSubscription: YouTubeChannelFeedSubscription = {
    accountId,
    feedSubscriptionId: makeFeedSubscriptionId(),
    feedType: FeedType.YouTubeChannel,
    channelId: PERSONAL_YOUTUBE_CHANNEL_ID,
    lifecycleState: ACTIVE_FEED_SUBSCRIPTION_LIFECYCLE_STATE,
    deliverySchedule: IMMEDIATE_DELIVERY_SCHEDULE,
    createdTime: new Date('2025-06-20T03:30:11.282Z'),
    lastUpdatedTime: new Date('2025-06-20T03:30:40.610Z'),
  };

  const feedItem1: VideoFeedItem = {
    accountId,
    feedItemContentType: FeedItemContentType.Video,
    feedItemId: makeFeedItemId(),
    origin: {
      feedType: FeedType.YouTubeChannel,
      feedSubscriptionId: feedSubscription.feedSubscriptionId,
    },
    importState: makeCompletedFeedItemImportState({
      // TODO: Make these relative to the current time.
      lastImportRequestedTime: new Date('2025-06-20T03:30:40.578Z'),
      lastSuccessfulImportTime: new Date('2025-06-20T03:30:40.607Z'),
    }),
    content: {
      feedItemContentType: FeedItemContentType.Video,
      title: 'Bridging the gap',
      url: 'https://www.youtube.com/watch?v=_cjTOlTxyQ8&t=6s',
      // TODO: Fill in this content.
      description:
        `My year of monthly self-improvement challenges begins with picking up a hobby I've long ` +
        `wanted to try: woodworking. See how I overcame the creative gap between my skills and ` +
        `taste to build a custom turntable station with my own two hands.`,
      summary: null,
    },
    triageStatus: TriageStatus.Untriaged,
    tagIds: {
      [SystemTagId.Unread]: true,
    },
    // TODO: Make these relative to the current time.
    createdTime: new Date('2025-06-20T03:30:11.282Z'),
    lastUpdatedTime: new Date('2025-06-20T03:30:40.610Z'),
  };

  return {
    feedSubscription,
    feedItems: [feedItem1],
  };
};
