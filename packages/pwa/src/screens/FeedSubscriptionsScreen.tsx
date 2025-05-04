import {useCallback, useEffect, useState} from 'react';

import {isValidUrl} from '@shared/lib/urls.shared';

import type {UserFeedSubscription} from '@shared/types/userFeedSubscriptions.types';

import {useUserFeedSubscriptionsService} from '@sharedClient/services/userFeedSubscriptions.client';

import {Button} from '@src/components/atoms/Button';
import {FlexColumn, FlexRow} from '@src/components/atoms/Flex';
import {Input} from '@src/components/atoms/Input';
import {Text} from '@src/components/atoms/Text';

import {Screen} from '@src/screens/Screen';

interface FeedAdderState {
  readonly url: string;
  readonly status: string;
}

const INITIAL_FEED_ADDER_STATE: FeedAdderState = {
  url: '',
  status: '',
};

const FeedAdder: React.FC = () => {
  const [state, setState] = useState<FeedAdderState>(INITIAL_FEED_ADDER_STATE);
  const userFeedSubscriptionsService = useUserFeedSubscriptionsService();

  const handleSubscribeToFeedUrl = useCallback(
    async (feedUrl: string): Promise<void> => {
      setState((current) => ({
        ...current,
        status: 'Subscribing to feed source...',
      }));

      const trimmedUrl = feedUrl.trim();
      if (!isValidUrl(trimmedUrl)) {
        setState((current) => ({
          ...current,
          status: 'Error: URL is not valid',
        }));
        return;
      }

      const subscribeResult = await userFeedSubscriptionsService.subscribeToUrl(trimmedUrl);
      if (!subscribeResult.success) {
        setState((current) => ({
          ...current,
          status: `Error subscribing to feed source: ${subscribeResult.error.message}`,
        }));
        return;
      }

      setState((current) => ({
        ...current,
        status: `Successfully subscribed to feed source`,
        url: '',
      }));
    },
    [userFeedSubscriptionsService]
  );

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
        <Button onClick={async () => void handleSubscribeToFeedUrl(state.url)}>Subscribe</Button>
      </FlexRow>

      {status ? (
        <Text className={status.includes('Error') ? 'text-error' : 'text-success'}>{status}</Text>
      ) : null}

      <FlexColumn gap={3}>
        <Text bold>Quick add feeds</Text>
        <FlexRow gap={3}>
          <Button
            variant="secondary"
            onClick={async () => void handleSubscribeToFeedUrl('https://jwn.gr/rss.xml')}
          >
            Personal blog feed
          </Button>
          <Button
            variant="secondary"
            onClick={async () =>
              void handleSubscribeToFeedUrl(
                'https://lorem-rss.herokuapp.com/feed?unit=second&interval=30'
              )
            }
          >
            Dummy feed w/ 30s updates
          </Button>
        </FlexRow>
      </FlexColumn>
    </FlexColumn>
  );
};

const FeedSubscriptionsList: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<UserFeedSubscription[]>([]);
  const [error, setError] = useState<string>('');
  const userFeedSubscriptionsService = useUserFeedSubscriptionsService();

  useEffect(() => {
    const unsubscribe = userFeedSubscriptionsService.watchAllSubscriptions({
      successCallback: (updatedSubscriptions) => {
        setSubscriptions(updatedSubscriptions);
        setError('');
      },
      errorCallback: () => {
        setError('Error loading feed subscriptions');
      },
    });

    return () => unsubscribe();
  }, [userFeedSubscriptionsService]);

  const handleUnsubscribe = async (subscription: UserFeedSubscription): Promise<void> => {
    const unsubscribeResult = await userFeedSubscriptionsService.updateSubscription(
      subscription.userFeedSubscriptionId,
      {
        isActive: false,
        unsubscribedTime: new Date(),
      }
    );

    if (!unsubscribeResult.success) {
      setError(`Error unsubscribing from feed: ${unsubscribeResult.error.message}`);
      return;
    }
  };

  const renderMainContent = (): React.ReactNode => {
    if (error) {
      return <Text className="text-error">Error loading feed subscriptions</Text>;
    }

    if (subscriptions.length === 0) {
      // TODO: Add better empty state.
      return <Text>None</Text>;
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
            {subscription.isActive ? (
              <Button
                variant="secondary"
                onClick={async () => void handleUnsubscribe(subscription)}
              >
                Unsubscribe
              </Button>
            ) : null}
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
