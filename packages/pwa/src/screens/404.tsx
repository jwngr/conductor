import {DEFAULT_NAV_ITEM} from '@shared/lib/navItems.shared';

import {Text} from '@src/components/atoms/Text';
import {NavItemLink} from '@src/components/nav/NavItemLink';

export const NotFoundScreen: React.FC<{readonly message: string}> = ({message}) => {
  const navItem = DEFAULT_NAV_ITEM;

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2">
      <Text as="h1">404</Text>
      <Text as="p">{message}</Text>
      <NavItemLink navItemId={navItem.id}>
        <Text as="p" underline="always">
          Go to {navItem.title}
        </Text>
      </NavItemLink>
    </div>
  );
};
