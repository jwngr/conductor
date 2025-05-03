import type React from 'react';

import type {CustomIcon} from '@shared/lib/customIcons.shared';
import {CustomIconType} from '@shared/lib/customIcons.shared';
import {ORDERED_SOURCE_NAV_ITEMS, ORDERED_VIEW_NAV_ITEMS} from '@shared/lib/navItems.shared';
import {assertNever} from '@shared/lib/utils.shared';

import type {NavItem} from '@shared/types/urls.types';

import {useFocusStore} from '@sharedClient/stores/FocusStore';

import {FlexColumn, FlexRow} from '@src/components/atoms/Flex';
import {Text} from '@src/components/atoms/Text';
import {TextIcon} from '@src/components/atoms/TextIcon';
import * as styles from '@src/components/nav/LeftSidebar.css';
import {NavItemLink} from '@src/components/nav/NavItemLink';

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

const LeftSidebarSection: React.FC<{
  readonly title: string;
  readonly navItems: readonly NavItem[];
}> = ({title, navItems}) => {
  const {focusedNavItemId, setFocusedNavItemId} = useFocusStore();
  return (
    <FlexColumn gap={3}>
      <Text as="h5" light>
        {title}
      </Text>
      <FlexColumn>
        {navItems.map((navItem, i) => (
          <NavItemLink
            key={`${i}-${navItem.id}`}
            navItemId={navItem.id}
            onClick={() => setFocusedNavItemId(navItem.id)}
            className={`${styles.sidebarItemLink} ${focusedNavItemId === navItem.id ? 'active' : ''}`.trim()}
          >
            <FlexRow gap={2}>
              <LeftSidebarItemAvatar icon={navItem.icon} />
              <Text as="p">{navItem.title}</Text>
            </FlexRow>
          </NavItemLink>
        ))}
      </FlexColumn>
    </FlexColumn>
  );
};

export const LeftSidebar: React.FC = () => {
  return (
    <FlexColumn overflow="auto" gap={4} padding={2} className={styles.sidebarWrapper}>
      <LeftSidebarSection title="Views" navItems={ORDERED_VIEW_NAV_ITEMS} />
      <LeftSidebarSection title="Sources" navItems={ORDERED_SOURCE_NAV_ITEMS} />
    </FlexColumn>
  );
};
