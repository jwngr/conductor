import {useEffect, useState} from 'react';
import styled from 'styled-components';

import {DevToolbarSectionType} from '@shared/types/devToolbar.types';

import {useDevToolbarStore} from '@sharedClient/stores/DevToolbarStore';

import {useUserFeedSubscriptionsService} from '@sharedClient/services/userFeedSubscriptions.client';

import {Button} from '@src/components/atoms/Button';

const StatusText = styled.div<{readonly $isError?: boolean}>`
  font-size: 12px;
  color: ${({theme, $isError}) => ($isError ? theme.colors.error : theme.colors.success)};
`;

const AccountFeedSubscriber: React.FC = () => {
  const userFeedSubscriptionsService = useUserFeedSubscriptionsService();

  const [status, setStatus] = useState<string>('');

  const handleSubscribeToFeedUrl = async (feedUrl: string): Promise<void> => {
    setStatus('Subscribing to feed source...');
    const subscribeResult = await userFeedSubscriptionsService.subscribeToUrl(feedUrl);
    if (!subscribeResult.success) {
      setStatus(`Error subscribing to feed source: ${subscribeResult.error.message}`);
      return;
    }

    setStatus(`Successfully subscribed to feed source: ${subscribeResult.value}`);
  };

  return (
    <>
      <Button
        variant="secondary"
        onClick={async () => void handleSubscribeToFeedUrl('https://jwn.gr/rss.xml')}
      >
        Subscribe to personal blog feed
      </Button>
      <Button
        variant="secondary"
        onClick={async () =>
          void handleSubscribeToFeedUrl(
            'https://lorem-rss.herokuapp.com/feed?unit=second&interval=30'
          )
        }
      >
        Subscribe to 30s feed
      </Button>
      {/* TODO: Add unsubscribe button. */}
      {status ? <StatusText $isError={status.includes('Error')}>{status}</StatusText> : null}
    </>
  );
};

export const RegisterAccountFeedSubscriberDevToolbarSection: React.FC = () => {
  const registerSection = useDevToolbarStore((state) => state.registerSection);

  useEffect(() => {
    return registerSection({
      sectionType: DevToolbarSectionType.AccountFeedSubscriber,
      title: 'Account feed subscriber',
      renderSection: () => <AccountFeedSubscriber />,
      requiresAuth: true,
    });
  }, [registerSection]);

  return null;
};
