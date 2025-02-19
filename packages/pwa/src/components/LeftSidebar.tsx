import type React from 'react';
import type {MouseEventHandler} from 'react';
import styled from 'styled-components';

import type {CustomIcon} from '@shared/lib/customIcons.shared';
import {CustomIconType} from '@shared/lib/customIcons.shared';
import {NavItems, ORDERED_VIEW_NAV_ITEMS} from '@shared/lib/navItems.shared';
import {assertNever} from '@shared/lib/utils.shared';

import {ThemeColor} from '@shared/types/theme.types';
import type {NavItem} from '@shared/types/urls.types';
import {NavItemId} from '@shared/types/urls.types';

import {useFocusStore} from '@sharedClient/stores/FocusStore';

import {FlexColumn, FlexRow} from '@src/components/atoms/Flex';
import {Link} from '@src/components/atoms/Link';
import {Text} from '@src/components/atoms/Text';
import {TextIcon} from '@src/components/atoms/TextIcon';

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

interface LeftSideItemWrapperProps {
  readonly $isActive: boolean;
}

const LeftSideItemWrapper = styled(FlexRow).attrs({
  gap: 8,
})<LeftSideItemWrapperProps>`
  padding: 8px 12px;
  border-radius: 4px;

  background-color: ${({$isActive, theme}) =>
    $isActive ? theme.colors[ThemeColor.Orange200] : 'transparent'};

  &:hover {
    background-color: ${({$isActive, theme}) =>
      theme.colors[$isActive ? ThemeColor.Orange300 : ThemeColor.Neutral300]};
  }

  // Animate on click.
  transition: transform 0.1s ease-in-out;
  &:active {
    transform: scale(0.95);
  }
`;

const LeftSidebarItemComponent: React.FC<{
  readonly url: string;
  readonly icon: CustomIcon;
  readonly title: string;
  readonly isActive: boolean;
  readonly onClick: MouseEventHandler<HTMLAnchorElement>;
}> = ({url, icon, title, isActive, onClick}) => {
  return (
    <Link to={url} onClick={onClick}>
      <LeftSideItemWrapper $isActive={isActive}>
        <LeftSidebarItemAvatar icon={icon} />
        <Text as="p">{title}</Text>
      </LeftSideItemWrapper>
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
      <FlexColumn style={{margin: '0 -12px'}}>
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

const LeftSidebarWrapper = styled(FlexColumn).attrs({gap: 16})`
  width: 200px;
  padding: 20px;
  background-color: ${({theme}) => theme.colors[ThemeColor.Neutral100]};
  border-right: solid 1px ${({theme}) => theme.colors[ThemeColor.Neutral300]};
  overflow: auto;
`;

export const LeftSidebar: React.FC = () => {
  return (
    <LeftSidebarWrapper>
      <LeftSidebarSection title="Views" navItems={ORDERED_VIEW_NAV_ITEMS} />
      <LeftSidebarSection title="Feeds" navItems={[NavItems.fromId(NavItemId.Feeds)]} />
    </LeftSidebarWrapper>
  );
};
