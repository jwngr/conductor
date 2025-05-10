import {useCallback, useState} from 'react';

import {prefixError} from '@shared/lib/errorUtils.shared';
import {parseUrl} from '@shared/lib/urls.shared';

import {
  useUserFeedSubscriptions,
  useUserFeedSubscriptionsService,
} from '@sharedClient/services/userFeedSubscriptions.client';

import {Button} from '@src/components/atoms/Button';
import {FlexColumn, FlexRow} from '@src/components/atoms/Flex';
import {Input} from '@src/components/atoms/Input';
import {Text} from '@src/components/atoms/Text';
import {FeedSubscriptionSettingsButton} from '@src/components/feedSubscriptions/FeedSubscriptionSettings';

import {Screen} from '@src/screens/Screen';

interface FeedAdderState {
  readonly url: string;
  readonly isSubscribing: boolean;
  readonly successMessage: string | null;
  readonly error: Error | null;
}

const INITIAL_FEED_ADDER_STATE: FeedAdderState = {
  url: '',
  isSubscribing: false,
  successMessage: null,
  error: null,
};

const FeedAdder: React.FC = () => {
  const [state, setState] = useState<FeedAdderState>(INITIAL_FEED_ADDER_STATE);
  const userFeedSubscriptionsService = useUserFeedSubscriptionsService();

  const setPending = useCallback(() => {
    setState((current) => ({...current, error: null, successMessage: null, isSubscribing: true}));
  }, []);

  const setError = useCallback((error: Error | null) => {
    setState((current) => ({...current, successMessage: null, error, isSubscribing: false}));
  }, []);

  const setSubscribed = useCallback(() => {
    setState((current) => ({
      ...current,
      successMessage: `Successfully subscribed to feed source`,
      url: '',
      error: null,
      isSubscribing: false,
    }));
  }, []);

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

      setSubscribed();
    },
    [setError, setPending, setSubscribed, userFeedSubscriptionsService]
  );

  const handleSubscribeToDummyFeed = useCallback(async (): Promise<void> => {
    setPending();

    // TODO: Implement this.

    setSubscribed();
  }, [setPending, setSubscribed]);

  return (
    <FlexColumn flex={1} gap={3}>
      <Text as="h3" bold>
        Add new feed
      </Text>

      <FlexRow gap={3} flex={1}>
        <Input
          type="text"
          value={state.url}
          placeholder="Enter RSS feed URL"
          onChange={(e) => setState((current) => ({...current, url: e.target.value}))}
          className="flex-1"
        />
        <Button onClick={async () => void handleSubscribeToRssFeedByUrl(state.url)}>
          Subscribe
        </Button>
      </FlexRow>

      {state.error ? (
        <Text className="text-error">{state.error.message}</Text>
      ) : state.isSubscribing ? (
        <Text light>Subscribing to feed...</Text>
      ) : state.successMessage ? (
        <Text className="text-success">{state.successMessage}</Text>
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
          <Button variant="default" onClick={async () => void handleSubscribeToDummyFeed()}>
            Dummy feed
          </Button>
        </FlexRow>
      </FlexColumn>
    </FlexColumn>
  );
};

const FeedSubscriptionsList: React.FC = () => {
  const userFeedSubscriptionsState = useUserFeedSubscriptions();

  const renderMainContent = (): React.ReactNode => {
    if (userFeedSubscriptionsState.error) {
      return (
        <Text as="p" className="text-error">
          Error loading feed subscriptions
        </Text>
      );
    }

    if (userFeedSubscriptionsState.isLoading) {
      return (
        <Text as="p" light>
          Loading...
        </Text>
      );
    }

    if (userFeedSubscriptionsState.subscriptions.length === 0) {
      // TODO: Add better empty state.
      return (
        <Text as="p" light>
          None
        </Text>
      );
    }

    return (
      <FlexColumn flex={1}>
        {userFeedSubscriptionsState.subscriptions.map((subscription) => (
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
