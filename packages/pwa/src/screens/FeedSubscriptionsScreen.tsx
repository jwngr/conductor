import {useEffect, useState} from 'react';
import styled from 'styled-components';

import {isValidUrl} from '@shared/lib/urls.shared';

import {ThemeColor} from '@shared/types/theme.types';
import type {UserFeedSubscription} from '@shared/types/userFeedSubscriptions.types';

import {useUserFeedSubscriptionsService} from '@sharedClient/services/userFeedSubscriptions.client';

import {AppHeader} from '@src/components/AppHeader';
import {Button, ButtonVariant} from '@src/components/atoms/Button';
import {FlexColumn, FlexRow} from '@src/components/atoms/Flex';
import {Input} from '@src/components/atoms/Input';
import {Text} from '@src/components/atoms/Text';
import {ScreenMainContentWrapper, ScreenWrapper} from '@src/components/layout/Screen';
import {LeftSidebar} from '@src/components/LeftSidebar';

const FeedSubscriptionsScreenMainContentWrapper = styled(FlexColumn)`
  flex: 1;
  padding: 20px;
  overflow: auto;
  gap: 24px;
`;

const FeedSubscriptionsListWrapper = styled(FlexColumn)`
  gap: 16px;
`;

const FeedSubscriptionItemsWrapper = styled(FlexColumn)`
  gap: 12px;
`;

const FeedSubscriptionItem = styled(FlexRow)`
  gap: 12px;
  padding: 12px;
  border: 1px solid ${({theme}) => theme.colors.border};
  border-radius: 8px;
  align-items: center;
`;

const FeedSubscriptionItemDetails = styled(FlexColumn)`
  flex: 1;
  gap: 4px;
`;

const StatusText = styled.div<{readonly $isError?: boolean}>`
  font-size: 14px;
  color: ${({theme, $isError}) => ($isError ? theme.colors.error : theme.colors.success)};
`;

const PreCannedFeedsWrapper = styled(FlexColumn)`
  gap: 12px;
`;

const PreCannedFeedsButtonsWrapper = styled(FlexRow)`
  gap: 12px;
  flex-wrap: wrap;
`;

const FeedAdderWrapper = styled(FlexColumn)`
  gap: 16px;
`;

const FeedAdderForm = styled(FlexRow)`
  gap: 12px;
  width: 100%;
`;

const FeedAdder: React.FC = () => {
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState('');
  const userFeedSubscriptionsService = useUserFeedSubscriptionsService();

  const handleSubscribeToFeedUrl = async (feedUrl: string) => {
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
        <Button variant={ButtonVariant.Primary} onClick={() => handleSubscribeToFeedUrl(url)}>
          Subscribe
        </Button>
      </FeedAdderForm>

      {status ? <StatusText $isError={status.includes('Error')}>{status}</StatusText> : null}

      <PreCannedFeedsWrapper>
        <Text bold>Quick add feeds</Text>
        <PreCannedFeedsButtonsWrapper>
          <Button
            variant={ButtonVariant.Secondary}
            onClick={() => handleSubscribeToFeedUrl('https://jwn.gr/rss.xml')}
          >
            Personal blog feed
          </Button>
          <Button
            variant={ButtonVariant.Secondary}
            onClick={() =>
              handleSubscribeToFeedUrl(
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

  const handleUnsubscribe = async (subscription: UserFeedSubscription) => {
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

  const renderMainContent = () => {
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
                variant={ButtonVariant.Secondary}
                onClick={() => handleUnsubscribe(subscription)}
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
    <ScreenWrapper>
      <AppHeader />
      <ScreenMainContentWrapper>
        <LeftSidebar />
        <FeedSubscriptionsScreenMainContentWrapper>
          <FeedAdder />
          <FeedSubscriptionsList />
        </FeedSubscriptionsScreenMainContentWrapper>
      </ScreenMainContentWrapper>
    </ScreenWrapper>
  );
};
