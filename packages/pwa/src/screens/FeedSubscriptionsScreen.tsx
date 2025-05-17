import {useCallback, useState} from 'react';

import {prefixError} from '@shared/lib/errorUtils.shared';
import {parseUrl} from '@shared/lib/urls.shared';
import {assertNever} from '@shared/lib/utils.shared';

import {AsyncStatus} from '@shared/types/asyncState.types';
import type {UserFeedSubscription} from '@shared/types/userFeedSubscriptions.types';

import {
  useUserFeedSubscriptions,
  useUserFeedSubscriptionsService,
} from '@sharedClient/services/userFeedSubscriptions.client';

import {useAsyncState} from '@sharedClient/hooks/asyncState.hooks';

import {Button} from '@src/components/atoms/Button';
import {FlexColumn, FlexRow} from '@src/components/atoms/Flex';
import {Input} from '@src/components/atoms/Input';
import {Text} from '@src/components/atoms/Text';
import {FeedSubscriptionSettingsButton} from '@src/components/feedSubscriptions/FeedSubscriptionSettings';

import {Screen} from '@src/screens/Screen';

const FeedAdder: React.FC = () => {
  const userFeedSubscriptionsService = useUserFeedSubscriptionsService();

  const [urlInputValue, setUrlInputValue] = useState('');
  const {asyncState, setPending, setError, setSuccess} = useAsyncState<undefined>();

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
        setError(prefixError(subscribeResult.error, 'Failed to subscribe to RSS feed'));
        return;
      }

      setSuccess(undefined);
      setUrlInputValue('');
    },
    [setError, setPending, setSuccess, userFeedSubscriptionsService]
  );

  const handleSubscribeToYouTubeChannel = useCallback(
    async (youtubeChannelUrl: string): Promise<void> => {
      setPending();

      const url = new URL(youtubeChannelUrl);
      const subscribeResult = await userFeedSubscriptionsService.subscribeToYouTubeChannel(url);
      if (!subscribeResult.success) {
        setError(prefixError(subscribeResult.error, 'Failed to subscribe to YouTube channel'));
        return;
      }

      setSuccess(undefined);
      setUrlInputValue('');
    },
    [setError, setPending, setSuccess, userFeedSubscriptionsService]
  );

  const handleSubscribeToDummyFeed = useCallback(async (): Promise<void> => {
    setPending();
    setError(new Error('TODO: Not implemented'));
  }, [setError, setPending]);

  return (
    <FlexColumn flex={1} gap={3}>
      <Text as="h3" bold>
        Add new feed
      </Text>

      <FlexRow gap={3} flex={1}>
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
        <Text className="text-error">{asyncState.error.message}</Text>
      ) : asyncState.status === AsyncStatus.Pending ? (
        <Text light>Subscribing to feed...</Text>
      ) : asyncState.status === AsyncStatus.Success ? (
        <Text className="text-success">Successfully subscribed to feed source</Text>
      ) : null}

      <FlexColumn gap={3}>
        <Text bold>Quick add feeds</Text>
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
            Lorem RSS feed w/ 30s updates
          </Button>
          <Button variant="default" onClick={async () => void handleSubscribeToDummyFeed()}>
            Dummy feed
          </Button>
        </FlexRow>
      </FlexColumn>
    </FlexColumn>
  );
};

const LoadedFeedSubscriptionsListMainContent: React.FC<{
  subscriptions: UserFeedSubscription[];
}> = ({subscriptions}) => {
  if (subscriptions.length === 0) {
    // TODO: Add better empty state.
    return (
      <Text as="p" light>
        None
      </Text>
    );
  }

  return (
    <FlexColumn flex={1}>
      {subscriptions.map((subscription) => (
        <FlexRow
          key={subscription.userFeedSubscriptionId}
          gap={3}
          padding={3}
          className="rounded-lg border border-gray-200"
        >
          <FlexColumn flex={1} gap={1}>
            <Text bold className={subscription.isActive ? undefined : 'text-error'}>
              {subscription.title}
            </Text>
            <Text as="p" light>
              {subscription.url}
            </Text>
          </FlexColumn>
          <FeedSubscriptionSettingsButton userFeedSubscription={subscription} />
        </FlexRow>
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
        return (
          <Text as="p" light>
            Loading...
          </Text>
        );
      case AsyncStatus.Error:
        return (
          <Text as="p" className="text-error">
            Error loading feed subscriptions
          </Text>
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
      <Text as="h3" bold>
        Active subscriptions
      </Text>
      {renderMainContent()}
    </FlexColumn>
  );
};

export const FeedSubscriptionsScreen: React.FC = () => {
  return (
    <Screen withHeader withLeftSidebar>
      <FlexRow flex={1} align="start" gap={8} padding={4} overflow="auto">
        <FeedAdder />
        <FeedSubscriptionsList />
      </FlexRow>
    </Screen>
  );
};
