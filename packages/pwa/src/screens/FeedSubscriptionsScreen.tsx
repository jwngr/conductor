import {useEffect, useState} from 'react';
import styled from 'styled-components';

import {isValidUrl} from '@shared/lib/urls.shared';

import {ThemeColor} from '@shared/types/theme.types';
import type {UserFeedSubscription} from '@shared/types/userFeedSubscriptions.types';

import {useUserFeedSubscriptionsService} from '@sharedClient/services/userFeedSubscriptions.client';

import {AppHeader} from '@src/components/AppHeader';
import {Button} from '@src/components/atoms/Button';
import {Input} from '@src/components/atoms/Input';
import {Text} from '@src/components/atoms/Text';
import {LeftSidebar} from '@src/components/LeftSidebar';

const FeedSubscriptionsScreenMainContentWrapper = styled.div`
  flex: 1;
  padding: 20px;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const FeedSubscriptionsListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FeedSubscriptionItemsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const FeedSubscriptionItem = styled.div`
  display: flex;
  flex-direction: row;
  gap: 12px;
  padding: 12px;
  border: 1px solid ${({theme}) => theme.colors.border};
  border-radius: 8px;
  align-items: center;
`;

const FeedSubscriptionItemDetails = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const StatusText = styled.div<{readonly $isError?: boolean}>`
  font-size: 14px;
  color: ${({theme, $isError}) => ($isError ? theme.colors.error : theme.colors.success)};
`;

const PreCannedFeedsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const PreCannedFeedsButtonsWrapper = styled.div`
  display: flex;
  flex-direction: row;
  gap: 12px;
  flex-wrap: wrap;
`;

const FeedAdderWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FeedAdderForm = styled.div`
  display: flex;
  flex-direction: row;
  gap: 12px;
  width: 100%;
`;

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
    <FeedAdderWrapper>
      <Text as="h3" bold>
        Add new feed
      </Text>

      <FeedAdderForm>
        <Input
          type="text"
          value={url}
          placeholder="Enter RSS feed URL"
          onChange={(e) => setUrl(e.target.value)}
          style={{flex: 1}}
        />
        <Button onClick={async () => void handleSubscribeToFeedUrl(url)}>Subscribe</Button>
      </FeedAdderForm>

      {status ? <StatusText $isError={status.includes('Error')}>{status}</StatusText> : null}

      <PreCannedFeedsWrapper>
        <Text bold>Quick add feeds</Text>
        <PreCannedFeedsButtonsWrapper>
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
        </PreCannedFeedsButtonsWrapper>
      </PreCannedFeedsWrapper>
    </FeedAdderWrapper>
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
      <FeedSubscriptionItemsWrapper>
        {subscriptions.map((subscription) => (
          <FeedSubscriptionItem key={subscription.userFeedSubscriptionId}>
            <FeedSubscriptionItemDetails>
              <Text bold color={subscription.isActive ? undefined : ThemeColor.Red500}>
                {subscription.title}
              </Text>
              <Text style={{fontSize: '14px'}}>{subscription.url}</Text>
            </FeedSubscriptionItemDetails>
            {subscription.isActive ? (
              <Button
                variant="secondary"
                onClick={async () => void handleUnsubscribe(subscription)}
              >
                Unsubscribe
              </Button>
            ) : null}
          </FeedSubscriptionItem>
        ))}
      </FeedSubscriptionItemsWrapper>
    );
  };

  return (
    <FeedSubscriptionsListWrapper>
      <Text as="h3" bold>
        Active feed subscriptions
      </Text>
      {renderMainContent()}
    </FeedSubscriptionsListWrapper>
  );
};

export const FeedSubscriptionsScreen: React.FC = () => {
  return (
    <div className="flex h-full w-full flex-col">
      <AppHeader />
      <div className="flex flex-1 items-stretch overflow-hidden">
        <LeftSidebar />
        <FeedSubscriptionsScreenMainContentWrapper>
          <FeedAdder />
          <FeedSubscriptionsList />
        </FeedSubscriptionsScreenMainContentWrapper>
      </div>
    </div>
  );
};
