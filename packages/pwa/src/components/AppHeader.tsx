import type React from 'react';

import {useLoggedInAccount} from '@sharedClient/hooks/auth.hooks';

import * as styles from '@src/components/AppHeader.css';
import {FlexRow} from '@src/components/atoms/Flex';
import {Link} from '@src/components/atoms/Link';
import {Spacer} from '@src/components/atoms/Spacer';
import {P} from '@src/components/atoms/Text';
import {RecentActivityFeed} from '@src/components/devToolbar/RecentActivityFeed';
import {ConductorLogo} from '@src/components/logos/ConductorLogo';

import {signOutRoute} from '@src/routes';

export const AppHeader: React.FC = () => {
  const loggedInAccount = useLoggedInAccount();

  return (
    <FlexRow className={styles.appHeader}>
      <ConductorLogo />
      <Spacer x={12} />
      <RecentActivityFeed />
      <Spacer flex />
      <P light>{loggedInAccount.email}</P>
      <Spacer x={12} />
      <Link to={signOutRoute.fullPath} replace>
        <P underline="hover">Sign out</P>
      </Link>
    </FlexRow>
  );
};
