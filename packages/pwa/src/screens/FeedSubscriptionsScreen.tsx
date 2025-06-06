import {useCallback, useState} from 'react';

import {prefixError} from '@shared/lib/errorUtils.shared';
import {parseUrl} from '@shared/lib/urls.shared';
import {assertNever} from '@shared/lib/utils.shared';

import {AsyncStatus} from '@shared/types/asyncState.types';
import {FeedSourceType} from '@shared/types/feedSourceTypes.types';
import type {UserFeedSubscription} from '@shared/types/userFeedSubscriptions.types';

import {
  DEFAULT_ROUTE_HERO_PAGE_ACTION,
  REFRESH_HERO_PAGE_ACTION,
} from '@sharedClient/lib/heroActions.client';
import {toast} from '@sharedClient/lib/toasts.client';

import {useAsyncState} from '@sharedClient/hooks/asyncState.hooks';
import {
  useUserFeedSubscriptions,
  useUserFeedSubscriptionsService,
} from '@sharedClient/hooks/userFeedSubscriptions.hooks';

import {Button} from '@src/components/atoms/Button';
import {FlexColumn, FlexRow} from '@src/components/atoms/Flex';
import {Input} from '@src/components/atoms/Input';
import {H3, H4, P} from '@src/components/atoms/Text';
import {ErrorArea} from '@src/components/errors/ErrorArea';
import {FeedSubscriptionSettingsButton} from '@src/components/feedSubscriptions/FeedSubscriptionSettings';
import {LoadingArea} from '@src/components/loading/LoadingArea';

import {Screen} from '@src/screens/Screen';

const FeedAdder: React.FC = () => {
  const userFeedSubscriptionsService = useUserFeedSubscriptionsService();

  const [urlInputValue, setUrlInputValue] = useState('');
  const {asyncState, setPending, setError, setSuccess} = useAsyncState<undefined>();

  const handleError = useCallback(
    (args: {readonly error: Error; readonly toastMessage: string}) => {
      const {error, toastMessage} = args;
      toast.error(toastMessage);
      const betterError = prefixError(error, toastMessage);
      setError(betterError);
    },
    [setError]
  );

  const handleSubscribeToRssFeedByUrl = useCallback(
    async (rssFeedUrl: string): Promise<void> => {
      const parsedUrl = parseUrl(rssFeedUrl.trim());
      if (!parsedUrl) {
        setError(new Error('URL is not valid'));
        return;
      }

      setPending();

      const subscribeResult = await userFeedSubscriptionsService.subscribeToRssFeed(parsedUrl);
      if (!subscribeResult.success) {
        handleError({
          error: subscribeResult.error,
          toastMessage: 'Failed to subscribe to RSS feed',
        });
        return;
      }

      setSuccess(undefined);
      setUrlInputValue('');
    },
    [handleError, setError, setPending, setSuccess, userFeedSubscriptionsService]
  );

  const handleSubscribeToYouTubeChannel = useCallback(
    async (youtubeChannelUrl: string): Promise<void> => {
      setPending();

      const subscribeResult =
        await userFeedSubscriptionsService.subscribeToYouTubeChannel(youtubeChannelUrl);
      if (!subscribeResult.success) {
        handleError({
          error: subscribeResult.error,
          toastMessage: 'Failed to subscribe to YouTube channel',
        });
        return;
      }

      setSuccess(undefined);
      setUrlInputValue('');
    },
    [handleError, setPending, setSuccess, userFeedSubscriptionsService]
  );

  const handleSubscribeToIntervalFeed = useCallback(async (): Promise<void> => {
    setPending();

    const subscribeResult = await userFeedSubscriptionsService.subscribeToIntervalFeed({
      intervalSeconds: 60,
    });
    if (!subscribeResult.success) {
      handleError({
        error: subscribeResult.error,
        toastMessage: 'Failed to subscribe to interval feed',
      });
      return;
    }

    setSuccess(undefined);
    setUrlInputValue('');
  }, [handleError, setPending, setSuccess, userFeedSubscriptionsService]);

  return (
    <FlexColumn flex gap={3}>
      <H3 bold>Add new feed</H3>

      <FlexRow gap={3} flex>
        <Input
          type="text"
          value={urlInputValue}
          placeholder="Enter RSS feed URL"
          onChange={(e) => setUrlInputValue(e.target.value)}
          className="flex-1"
        />
        <Button onClick={async () => void handleSubscribeToRssFeedByUrl(urlInputValue)}>
          Subscribe
        </Button>
      </FlexRow>

      {asyncState.status === AsyncStatus.Error ? (
        <P error>{asyncState.error.message}</P>
      ) : asyncState.status === AsyncStatus.Pending ? (
        <P light>Subscribing to feed...</P>
      ) : asyncState.status === AsyncStatus.Success ? (
        <P success>Successfully subscribed to feed source</P>
      ) : null}

      <FlexColumn gap={3}>
        <H4 bold>Quick add feeds</H4>
        <FlexRow gap={3}>
          <Button
            variant="default"
            onClick={async () => void handleSubscribeToRssFeedByUrl('https://jwn.gr/rss.xml')}
          >
            Personal blog feed
          </Button>
          <Button
            variant="default"
            onClick={async () =>
              void handleSubscribeToRssFeedByUrl(
                'https://lorem-rss.herokuapp.com/feed?unit=second&interval=30'
              )
            }
          >
            Lorem RSS feed w/ 30s updates
          </Button>
          <Button
            variant="default"
            onClick={async () =>
              void handleSubscribeToYouTubeChannel(
                'https://www.youtube.com/channel/UCndkjnoQawp7Tjy1uNj53yQ'
              )
            }
          >
            Personal YouTube channel
          </Button>
          <Button variant="default" onClick={async () => void handleSubscribeToIntervalFeed()}>
            Interval feed
          </Button>
        </FlexRow>
      </FlexColumn>
    </FlexColumn>
  );
};

const FeedSubscriptionItem: React.FC<{
  subscription: UserFeedSubscription;
}> = ({subscription}) => {
  let primaryRowText: string;
  let secondaryRowText: string | null;

  switch (subscription.feedSourceType) {
    case FeedSourceType.RSS:
      primaryRowText = `RSS (${subscription.title ?? subscription.url})`;
      secondaryRowText = subscription.title ?? null;
      break;
    case FeedSourceType.YouTubeChannel:
      primaryRowText = 'YouTube';
      secondaryRowText = subscription.channelId;
      break;
    case FeedSourceType.Interval:
      primaryRowText = 'Interval';
      secondaryRowText = null;
      break;
    default:
      assertNever(subscription);
  }

  return (
    <FlexRow gap={3} padding={3} className="border-neutral-2 rounded-lg border">
      <FlexColumn flex gap={1}>
        <P bold error={!subscription.isActive}>
          {primaryRowText}
        </P>
        {secondaryRowText ? <P light>{secondaryRowText}</P> : null}
      </FlexColumn>
      <FeedSubscriptionSettingsButton userFeedSubscription={subscription} />
    </FlexRow>
  );
};

const LoadedFeedSubscriptionsListMainContent: React.FC<{
  subscriptions: UserFeedSubscription[];
}> = ({subscriptions}) => {
  if (subscriptions.length === 0) {
    // TODO: Add better empty state.
    return <P light>None</P>;
  }

  return (
    <FlexColumn flex>
      {subscriptions.map((subscription) => (
        <FeedSubscriptionItem
          key={subscription.userFeedSubscriptionId}
          subscription={subscription}
        />
      ))}
    </FlexColumn>
  );
};

const FeedSubscriptionsList: React.FC = () => {
  const userFeedSubscriptionsState = useUserFeedSubscriptions();

  const renderMainContent = (): React.ReactNode => {
    switch (userFeedSubscriptionsState.status) {
      case AsyncStatus.Idle:
      case AsyncStatus.Pending:
        return <LoadingArea text="Loading feed subscriptions..." />;
      case AsyncStatus.Error:
        return (
          <ErrorArea
            error={userFeedSubscriptionsState.error}
            title="Error loading feed subscriptions"
            subtitle="Refreshing may resolve the issue. If the problem persists, please contact support."
            actions={[DEFAULT_ROUTE_HERO_PAGE_ACTION, REFRESH_HERO_PAGE_ACTION]}
          />
        );
      case AsyncStatus.Success:
        return (
          <LoadedFeedSubscriptionsListMainContent
            subscriptions={userFeedSubscriptionsState.value}
          />
        );
      default:
        assertNever(userFeedSubscriptionsState);
    }
  };

  return (
    <FlexColumn gap={3} style={{width: 360}}>
      <H3 bold>Active subscriptions</H3>
      {renderMainContent()}
    </FlexColumn>
  );
};

export const FeedSubscriptionsScreen: React.FC = () => {
  return (
    <Screen withHeader withLeftSidebar>
      <FlexRow flex align="start" gap={8} padding={4} overflow="auto">
        <FeedAdder />
        <FeedSubscriptionsList />
      </FlexRow>
    </Screen>
  );
};
