import type React from 'react';

import {Urls} from '@shared/lib/urls.shared';

import {useLoggedInAccount} from '@sharedClient/hooks/auth.hooks';

import {Link} from '@src/components/atoms/Link';
import {Spacer} from '@src/components/atoms/Spacer';
import {Text} from '@src/components/atoms/Text';
import {RecentActivityFeed} from '@src/components/devToolbar/RecentActivityFeed';

import {cn} from '@src/lib/utils.pwa';

export const AppHeader: React.FC = () => {
  const loggedInAccount = useLoggedInAccount();

  return (
    <div className={cn('flex h-[60px] flex-row items-center border-b px-4')}>
      <Text as="h2">Conductor</Text>
      <Spacer x={12} />
      <RecentActivityFeed />
      <Spacer flex />
      <Text light>{loggedInAccount.email}</Text>
      <Spacer x={12} />
      <Link to="/logout">
        <Text as="p" underline="hover">
          Sign out
        </Text>
      </Link>
    </div>
  );
};
