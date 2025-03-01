import type React from 'react';
import type {MouseEventHandler} from 'react';

import type {CustomIcon} from '@shared/lib/customIcons.shared';
import {CustomIconType} from '@shared/lib/customIcons.shared';
import {NavItems, ORDERED_VIEW_NAV_ITEMS} from '@shared/lib/navItems.shared';
import {assertNever} from '@shared/lib/utils.shared';

import type {NavItem} from '@shared/types/urls.types';
import {NavItemId} from '@shared/types/urls.types';

import {useFocusStore} from '@sharedClient/stores/FocusStore';

import {FlexColumn, FlexRow} from '@src/components/atoms/Flex';
import {Link} from '@src/components/atoms/Link';
import {Text} from '@src/components/atoms/Text';
import {TextIcon} from '@src/components/atoms/TextIcon';

import {cn} from '@src/lib/utils';

const LeftSidebarItemAvatar: React.FC<{
  readonly icon: CustomIcon;
}> = ({icon}) => {
  switch (icon.type) {
    case CustomIconType.Emoji:
      return <div>{icon.emoji}</div>;
    case CustomIconType.Icon:
      return <TextIcon name={icon.iconName} size={16} />;
    case CustomIconType.CustomFile:
      return <img src={icon.srcUrl} alt="Custom uploaded image" />;
    default:
      assertNever(icon);
  }
};

const LeftSidebarItemComponent: React.FC<{
  readonly url: string;
  readonly icon: CustomIcon;
  readonly title: string;
  readonly isActive: boolean;
  readonly onClick: MouseEventHandler<HTMLAnchorElement>;
}> = ({url, icon, title, isActive, onClick}) => {
  return (
    <Link to={url} onClick={onClick}>
      <FlexRow
        gap={8}
        className={cn(
          'rounded px-3 py-2',
          'transition-transform active:scale-95',
          isActive ? 'bg-orange-200 hover:bg-orange-300' : 'bg-transparent hover:bg-neutral-300'
        )}
      >
        <LeftSidebarItemAvatar icon={icon} />
        <Text as="p">{title}</Text>
      </FlexRow>
    </Link>
  );
};

const LeftSidebarSection: React.FC<{
  readonly title: string;
  readonly navItems: readonly NavItem[];
}> = ({title, navItems}) => {
  const {focusedNavItemId, setFocusedNavItemId} = useFocusStore();
  return (
    <FlexColumn>
      <Text as="h5" light>
        {title}
      </Text>
      <FlexColumn className="mx-[-12px]">
        {navItems.map((navItem, i) => (
          <LeftSidebarItemComponent
            key={`${i}-${navItem.url}`}
            url={navItem.url}
            icon={navItem.icon}
            title={navItem.title}
            isActive={focusedNavItemId === navItem.id}
            onClick={() => setFocusedNavItemId(navItem.id)}
          />
        ))}
      </FlexColumn>
    </FlexColumn>
  );
};

export const LeftSidebar: React.FC = () => {
  return (
    <FlexColumn
      gap={16}
      className="w-[200px] overflow-auto border-r border-neutral-300 bg-neutral-100 p-5"
    >
      <LeftSidebarSection title="Views" navItems={ORDERED_VIEW_NAV_ITEMS} />
      <LeftSidebarSection title="Feeds" navItems={[NavItems.fromId(NavItemId.Feeds)]} />
    </FlexColumn>
  );
};
