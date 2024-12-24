import {useEffect, useState} from 'react';
import styled from 'styled-components';

import {DevToolbarSectionType} from '@shared/types/devToolbar.types';

import {useDevToolbarStore} from '@sharedClient/stores/DevToolbarStore';

import {Button, ButtonVariant} from '@src/components/atoms/Button';

import {useUserFeedSubscriptionsService} from '@src/lib/userFeedSubscriptions.pwa';

const StatusText = styled.div<{readonly $isError?: boolean}>`
  font-size: 12px;
  color: ${({theme, $isError}) => ($isError ? theme.colors.error : theme.colors.success)};
`;

const UserFeedSubscriber: React.FC = () => {
  const userFeedSubscriptionsService = useUserFeedSubscriptionsService();

  const [status, setStatus] = useState<string>('');

  const handleSubscribeToFeedUrl = async (feedUrl: string) => {
    setStatus('Subscribing to feed...');
    const subscribeResult = await userFeedSubscriptionsService.subscribeToFeedUrl(feedUrl);
    if (!subscribeResult.success) {
      setStatus(`Error subscribing to feed: ${subscribeResult.error}`);
      return;
    }

    setStatus(`Successfully subscribed to feed: ${subscribeResult.value}`);
  };

  return (
    <>
      <Button
        variant={ButtonVariant.Secondary}
        onClick={() => handleSubscribeToFeedUrl('https://jwn.gr/rss.xml')}
      >
        Subscribe to personal website feed
      </Button>
      {/* TODO: Add unsubscribe button. */}
      {status ? <StatusText $isError={status.includes('Error')}>{status}</StatusText> : null}
    </>
  );
};

export const RegisterUserFeedSubscriberDevToolbarSection: React.FC = () => {
  const registerSection = useDevToolbarStore((state) => state.registerSection);

  useEffect(() => {
    return registerSection({
      sectionType: DevToolbarSectionType.UserFeedSubscriber,
      title: 'User feed subscriber',
      renderSection: () => <UserFeedSubscriber />,
    });
  }, [registerSection]);

  return null;
};
