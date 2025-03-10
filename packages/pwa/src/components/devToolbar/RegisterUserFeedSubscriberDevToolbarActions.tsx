import {useEffect, useState} from 'react';

import {DevToolbarSectionType} from '@shared/types/devToolbar.types';

import {useDevToolbarStore} from '@sharedClient/stores/DevToolbarStore';

import {useUserFeedSubscriptionsService} from '@sharedClient/services/userFeedSubscriptions.client';

import {Button} from '@src/components/atoms/Button';

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

  const isError = status.includes('Error');

  return (
    <>
      <Button
        variant="outline"
        onClick={async () => void handleSubscribeToFeedUrl('https://jwn.gr/rss.xml')}
      >
        Subscribe to personal blog feed
      </Button>
      <Button
        variant="outline"
        onClick={async () =>
          void handleSubscribeToFeedUrl(
            'https://lorem-rss.herokuapp.com/feed?unit=second&interval=30'
          )
        }
      >
        Subscribe to 30s feed
      </Button>
      {/* TODO: Add unsubscribe button. */}
      {status ? (
        <div className={`text-xs ${isError ? 'text-error' : 'text-success'}`}>{status}</div>
      ) : null}
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
