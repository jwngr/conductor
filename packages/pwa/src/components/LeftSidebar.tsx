import type React from 'react';

import type {CustomIcon} from '@shared/lib/customIcons.shared';
import {CustomIconType} from '@shared/lib/customIcons.shared';
import {NavItems, ORDERED_VIEW_NAV_ITEMS} from '@shared/lib/navItems.shared';
import {assertNever} from '@shared/lib/utils.shared';

import type {NavItem} from '@shared/types/urls.types';
import {NavItemId} from '@shared/types/urls.types';
import type {StyleAttributes, Task} from '@shared/types/utils.types';

import {useFocusStore} from '@sharedClient/stores/FocusStore';

import {Link} from '@src/components/atoms/Link';
import {Text} from '@src/components/atoms/Text';
import {TextIcon} from '@src/components/atoms/TextIcon';
import * as styles from '@src/components/LeftSidebar.css';

import {
  allViewRoute,
  doneViewRoute,
  feedSubscriptionsRoute,
  importRoute,
  savedViewRoute,
  starredViewRoute,
  todayViewRoute,
  trashedViewRoute,
  unreadViewRoute,
  untriagedViewRoute,
} from '@src/routes';

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

interface LeftSidebarItemLinkProps extends StyleAttributes {
  readonly navItem: NavItem;
  readonly onClick: Task;
}

const LeftSidebarItemLink: React.FC<LeftSidebarItemLinkProps> = ({navItem, onClick, className}) => {
  const innerContent = (
    <div className={styles.sidebarItemDiv}>
      <LeftSidebarItemAvatar icon={navItem.icon} />
      <Text as="p">{navItem.title}</Text>
    </div>
  );

  switch (navItem.id) {
    case NavItemId.All:
      return (
        <Link to={allViewRoute.fullPath} onClick={onClick} className={className}>
          {innerContent}
        </Link>
      );
    case NavItemId.Done:
      return (
        <Link to={doneViewRoute.fullPath} onClick={onClick} className={className}>
          {innerContent}
        </Link>
      );
    case NavItemId.Saved:
      return (
        <Link to={savedViewRoute.fullPath} onClick={onClick} className={className}>
          {innerContent}
        </Link>
      );
    case NavItemId.Starred:
      return (
        <Link to={starredViewRoute.fullPath} onClick={onClick} className={className}>
          {innerContent}
        </Link>
      );
    case NavItemId.Today:
      return (
        <Link to={todayViewRoute.fullPath} onClick={onClick} className={className}>
          {innerContent}
        </Link>
      );
    case NavItemId.Trashed:
      return (
        <Link to={trashedViewRoute.fullPath} onClick={onClick} className={className}>
          {innerContent}
        </Link>
      );
    case NavItemId.Unread:
      return (
        <Link to={unreadViewRoute.fullPath} onClick={onClick} className={className}>
          {innerContent}
        </Link>
      );
    case NavItemId.Untriaged:
      return (
        <Link to={untriagedViewRoute.fullPath} onClick={onClick} className={className}>
          {innerContent}
        </Link>
      );
    case NavItemId.Feeds:
      return (
        <Link to={feedSubscriptionsRoute.fullPath} onClick={onClick} className={className}>
          {innerContent}
        </Link>
      );
    case NavItemId.Import:
      return (
        <Link to={importRoute.fullPath} onClick={onClick} className={className}>
          {innerContent}
        </Link>
      );
    default:
      assertNever(navItem.id);
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
          <LeftSidebarItemLink
            key={`${i}-${navItem.id}`}
            navItem={navItem}
            onClick={() => setFocusedNavItemId(navItem.id)}
            className={`${styles.sidebarItemLink} ${focusedNavItemId === navItem.id ? 'active' : ''}`.trim()}
          />
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
