import type React from 'react';

import {Urls} from '@shared/lib/urls.shared';

import {useMaybeLoggedInAccount} from '@sharedClient/hooks/auth.hooks';

import {FlexRow} from '@src/components/atoms/Flex';
import {Link} from '@src/components/atoms/Link';
import {Spacer} from '@src/components/atoms/Spacer';
import {Text} from '@src/components/atoms/Text';

import {cn} from '@src/lib/utils';

export const AppHeader: React.FC = () => {
  const {isLoading, loggedInAccount} = useMaybeLoggedInAccount();

  let authContent: React.ReactNode = null;
  if (!isLoading && loggedInAccount) {
    authContent = (
      <>
        <Text light>{loggedInAccount.email}</Text>
        <Spacer x={12} />
        <Link to={Urls.forSignOut()}>
          <Text underline="hover">Sign out</Text>
        </Link>
      </>
    );
  }

  return (
    <FlexRow className={cn('h-[60px] border-b px-4')}>
      <Text as="h2">Conductor</Text>
      <Spacer flex />
      {authContent}
    </FlexRow>
  );
};
