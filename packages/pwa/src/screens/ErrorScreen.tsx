import {NavItems} from '@shared/lib/navItems.shared';

import {NavItemId} from '@shared/types/urls.types';

import {Link} from '@src/components/atoms/Link';
import {Text} from '@src/components/atoms/Text';

import {rootRoute} from '@src/routes/__root';

// TODO: Improve design of error screen.
export const ErrorScreen: React.FC<{readonly error: Error}> = ({error}) => {
  const navItem = NavItems.fromId(NavItemId.Untriaged);
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="flex max-w-[960px] flex-col items-center gap-8">
        <Text as="h1">Oops... something went wrong</Text>
        <Text as="p">{error.message}</Text>
        <Link to={rootRoute.fullPath}>
          <Text as="p" underline="always">
            Go to {navItem.title}
          </Text>
        </Link>
      </div>
    </div>
  );
};
