import {useEffect, useState} from 'react';
import styled from 'styled-components';

import {DevToolbarSectionType} from '@shared/types/devToolbar.types';

import {useDevToolbarStore} from '@sharedClient/stores/DevToolbarStore';

import {useUserFeedSubscriptionsService} from '@sharedClient/services/userFeedSubscriptions.client';

import {Button, ButtonVariant} from '@src/components/atoms/Button';

const StatusText = styled.div<{readonly $isError?: boolean}>`
  font-size: 12px;
  color: ${({theme, $isError}) => ($isError ? theme.colors.error : theme.colors.success)};
`;

const UserFeedSubscriber: React.FC = () => {
  const userFeedSubscriptionsService = useUserFeedSubscriptionsService();

  const [status, setStatus] = useState<string>('');

  const handleSubscribeToFeedUrl = async (feedUrl: string) => {
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
        variant={ButtonVariant.Secondary}
        onClick={() => handleSubscribeToFeedUrl('https://jwn.gr/rss.xml')}
      >
        Subscribe to personal website feed source
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
      title: 'User feed sourcesubscriber',
      renderSection: () => <UserFeedSubscriber />,
    });
  }, [registerSection]);

  return null;
};
