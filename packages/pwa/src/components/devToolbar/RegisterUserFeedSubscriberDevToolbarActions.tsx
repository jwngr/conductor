import {useEffect} from 'react';

import {DevToolbarSectionType} from '@shared/types/devToolbar.types';

import {useDevToolbarStore} from '@shared/stores/DevToolbarStore';

import {Button, ButtonVariant} from '@src/components/atoms/Button';

import {useUserFeedSubscriptionsService} from '@src/lib/userFeedSubscriptions.pwa';

const UserFeedSubscriber: React.FC = () => {
  const userFeedSubscriptionsService = useUserFeedSubscriptionsService();

  return (
    <>
      <Button
        variant={ButtonVariant.Secondary}
        onClick={() => {
          userFeedSubscriptionsService.subscribeToFeedUrl('https://jwn.gr/rss.xml');
        }}
      >
        Subscribe to personal website feed
      </Button>
      {/* TODO: Add unsubscribe button. */}
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
