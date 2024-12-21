import {useEffect} from 'react';

import {useDevToolbarStore} from '@shared/stores/DevToolbarStore';

import {useUserFeedSubscriptionsService} from '@src/lib/userFeedSubscriptions.pwa';

export const RegisterUserFeedSubscriberDevTool: React.FC = () => {
  const userFeedSubscriptionsService = useUserFeedSubscriptionsService();

  const registerAction = useDevToolbarStore((state) => state.registerAction);

  useEffect(() => {
    const unsubscribeA = registerAction({
      actionId: 'SUBSCRIBE_TO_PERSONAL_FEED',
      text: 'Subscribe to personal website feed',
      onClick: () => {
        userFeedSubscriptionsService.subscribeToFeedUrl('https://jwn.gr/rss.xml');
      },
    });
    const unsubscribeB = registerAction({
      actionId: 'UNSUBSCRIBE_FROM_PERSONAL_FEED',
      text: 'Unsubscribe from personal website feed',
      onClick: () => {
        userFeedSubscriptionsService.unsubscribeFromFeedUrl('https://jwn.gr/rss.xml');
      },
    });
    return () => {
      unsubscribeA();
      unsubscribeB();
    };
  }, [registerAction, userFeedSubscriptionsService]);

  return null;
};
