import type React from 'react';

import {useLoggedInAccount} from '@sharedClient/hooks/auth.hooks';

import * as styles from '@src/components/AppHeader.css';
import {FlexRow} from '@src/components/atoms/Flex';
import {Link} from '@src/components/atoms/Link';
import {Spacer} from '@src/components/atoms/Spacer';
import {Text} from '@src/components/atoms/Text';
import {RecentActivityFeed} from '@src/components/devToolbar/RecentActivityFeed';

import {signOutRoute} from '@src/routes';

export const AppHeader: React.FC = () => {
  const loggedInAccount = useLoggedInAccount();

  return (
    <FlexRow className={styles.appHeader}>
      <Text as="h2">Conductor</Text>
      <Spacer x={12} />
      <RecentActivityFeed />
      <Spacer flex />
      <Text light>{loggedInAccount.email}</Text>
      <Spacer x={12} />
      <Link to={signOutRoute.fullPath} replace>
        <Text as="p" underline="hover">
          Sign out
        </Text>
      </Link>
    </FlexRow>
  );
};
