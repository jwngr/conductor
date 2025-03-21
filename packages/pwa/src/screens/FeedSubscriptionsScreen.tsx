import {useEffect, useState} from 'react';

import {isValidUrl} from '@shared/lib/urls.shared';

import {ThemeColor} from '@shared/types/theme.types';
import type {UserFeedSubscription} from '@shared/types/userFeedSubscriptions.types';

import {useUserFeedSubscriptionsService} from '@sharedClient/services/userFeedSubscriptions.client';

import {AppHeader} from '@src/components/AppHeader';
import {Button} from '@src/components/atoms/Button';
import {Input} from '@src/components/atoms/Input';
import {Text} from '@src/components/atoms/Text';
import {LeftSidebar} from '@src/components/LeftSidebar';

const FeedAdder: React.FC = () => {
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState('');
  const userFeedSubscriptionsService = useUserFeedSubscriptionsService();

  const handleSubscribeToFeedUrl = async (feedUrl: string): Promise<void> => {
    setStatus('Subscribing to feed source...');

    const trimmedUrl = feedUrl.trim();
    if (!isValidUrl(trimmedUrl)) {
      setStatus('URL is not valid');
      return;
    }

    const subscribeResult = await userFeedSubscriptionsService.subscribeToUrl(trimmedUrl);
    if (!subscribeResult.success) {
      setStatus(`Error subscribing to feed source: ${subscribeResult.error.message}`);
      return;
    }

    setStatus(`Successfully subscribed to feed source`);
    setUrl('');
  };

  return (
    <div className="flex flex-col gap-4">
      <Text as="h3" bold>
        Add new feed
      </Text>

      <div className="flex w-full gap-3">
        <Input
          type="text"
          value={url}
          placeholder="Enter RSS feed URL"
          onChange={(e) => setUrl(e.target.value)}
          className="flex-1"
        />
        <Button onClick={async () => void handleSubscribeToFeedUrl(url)}>Subscribe</Button>
      </div>

      {status ? (
        <div className={`text-sm ${status.includes('Error') ? 'text-red-500' : 'text-green-500'}`}>
          {status}
        </div>
      ) : null}

      <div className="flex flex-col gap-3">
        <Text bold>Quick add feeds</Text>
        <div className="flex flex-wrap gap-3">
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
        </div>
      </div>
    </div>
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
      return <Text color={ThemeColor.Red500}>Error loading feed subscriptions</Text>;
    }

    if (subscriptions.length === 0) {
      return <Text>No feed subscriptions yet. Add one above to get started!</Text>;
    }

    return (
      <div className="flex flex-col gap-3">
        {subscriptions.map((subscription) => (
          <div
            key={subscription.userFeedSubscriptionId}
            className="flex items-center gap-3 rounded-lg border border-gray-200 p-3"
          >
            <div className="flex flex-1 flex-col gap-1">
              <Text bold color={subscription.isActive ? undefined : ThemeColor.Red500}>
                {subscription.title}
              </Text>
              <Text className="text-sm">{subscription.url}</Text>
            </div>
            {subscription.isActive ? (
              <Button
                variant="secondary"
                onClick={async () => void handleUnsubscribe(subscription)}
              >
                Unsubscribe
              </Button>
            ) : null}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <Text as="h3" bold>
        Active feed subscriptions
      </Text>
      {renderMainContent()}
    </div>
  );
};

export const FeedSubscriptionsScreen: React.FC = () => {
  return (
    <div className="flex h-full w-full flex-col">
      <AppHeader />
      <div className="flex flex-1 items-stretch overflow-hidden">
        <LeftSidebar />
        <div className="flex flex-1 flex-col gap-6 overflow-auto p-5">
          <FeedAdder />
          <FeedSubscriptionsList />
        </div>
      </div>
    </div>
  );
};
