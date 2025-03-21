import {NavItems} from '@shared/lib/navItems.shared';

import {NavItemId} from '@shared/types/urls.types';

import {Link} from '@src/components/atoms/Link';
import {Text} from '@src/components/atoms/Text';

export const NotFoundScreen: React.FC<{readonly message: string}> = ({message}) => {
  const navItem = NavItems.fromId(NavItemId.Untriaged);
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2">
      <Text as="h1">404</Text>
      <Text as="p">{message}</Text>
      <Link to="/">
        <Text as="p" underline="always">
          Go to {navItem.title}
        </Text>
      </Link>
    </div>
  );
};
