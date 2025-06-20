import {NavItemId} from '@shared/types/urls.types';

import {useLoggedInAccount} from '@sharedClient/hooks/auth.hooks';

import {FlexRow} from '@src/components/atoms/Flex';
import {Link} from '@src/components/atoms/Link';
import {Spacer} from '@src/components/atoms/Spacer';
import {P} from '@src/components/atoms/Text';
import {RecentActivityFeed} from '@src/components/devToolbar/RecentActivityFeed';
import {NavItemWithCount} from '@src/components/nav/NavItemWithCount';
import * as styles from '@src/components/TopBar.css';

import {signOutRoute} from '@src/routes';

export const TopBar: React.FC<{
  readonly selectedNavItemId: NavItemId | null;
}> = ({selectedNavItemId}) => {
  const loggedInAccount = useLoggedInAccount();

  // TODO: Update this to use real data.
  const orderedNavItemsWithCounts = [
    {navItemId: NavItemId.Saved, newCount: 0, totalCount: 0},
    {navItemId: NavItemId.Untriaged, newCount: 1, totalCount: 4},
  ] as const;

  return (
    <FlexRow className={styles.topBar}>
      <FlexRow gap={8}>
        {orderedNavItemsWithCounts.map(({navItemId, newCount, totalCount}) => (
          <NavItemWithCount
            key={navItemId}
            navItemId={navItemId}
            newCount={newCount}
            totalCount={totalCount}
            isSelected={navItemId === selectedNavItemId}
          />
        ))}
      </FlexRow>
      <Spacer flex />
      <RecentActivityFeed />
      <Spacer x={12} />
      <P light>{loggedInAccount.email}</P>
      <Spacer x={12} />
      <Link to={signOutRoute.to} replace>
        <P underline="hover">Sign out</P>
      </Link>
    </FlexRow>
  );
};
