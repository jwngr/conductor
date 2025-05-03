import {DEFAULT_NAV_ITEM} from '@shared/lib/navItems.shared';

import {Text} from '@src/components/atoms/Text';
import {NavItemLink} from '@src/components/nav/NavItemLink';

// TODO: Improve design of error screen.
export const ErrorScreen: React.FC<{readonly error: Error}> = ({error}) => {
  const navItem = DEFAULT_NAV_ITEM;

  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="flex max-w-[960px] flex-col items-center gap-8">
        <Text as="h1">Oops... something went wrong</Text>
        <Text as="p">{error.message}</Text>
        <NavItemLink navItemId={navItem.id}>
          <Text as="p" underline="always">
            Go to {navItem.title}
          </Text>
        </NavItemLink>
      </div>
    </div>
  );
};
