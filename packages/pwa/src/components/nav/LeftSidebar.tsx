import type React from 'react';

import type {CustomIcon} from '@shared/lib/customIcons.shared';
import {CustomIconType} from '@shared/lib/customIcons.shared';
import {NavItems, ORDERED_VIEW_NAV_ITEMS} from '@shared/lib/navItems.shared';
import {assertNever} from '@shared/lib/utils.shared';

import type {NavItem} from '@shared/types/urls.types';
import {NavItemId} from '@shared/types/urls.types';

import {useFocusStore} from '@sharedClient/stores/FocusStore';

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
    <div className={styles.sidebarSectionWrapper}>
      <Text as="h5" light>
        {title}
      </Text>
      <div className={styles.sidebarSectionItemsWrapper}>
        {navItems.map((navItem, i) => (
          <NavItemLink
            key={`${i}-${navItem.id}`}
            navItemId={navItem.id}
            onClick={() => setFocusedNavItemId(navItem.id)}
            className={`${styles.sidebarItemLink} ${focusedNavItemId === navItem.id ? 'active' : ''}`.trim()}
          >
            <div className={styles.sidebarItemDiv}>
              <LeftSidebarItemAvatar icon={navItem.icon} />
              <Text as="p">{navItem.title}</Text>
            </div>
          </NavItemLink>
        ))}
      </div>
    </div>
  );
};

export const LeftSidebar: React.FC = () => {
  return (
    <div className={styles.sidebarWrapper}>
      <LeftSidebarSection title="Views" navItems={ORDERED_VIEW_NAV_ITEMS} />
      <LeftSidebarSection
        title="Feeds & Imports"
        navItems={[NavItems.fromId(NavItemId.Feeds), NavItems.fromId(NavItemId.Import)]}
      />
    </div>
  );
};
