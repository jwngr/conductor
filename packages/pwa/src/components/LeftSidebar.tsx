import React from 'react';
import {useMatch} from 'react-router-dom';
import styled from 'styled-components';

import {CustomIcon, CustomIconType} from '@shared/lib/customIcons';
import {Urls} from '@shared/lib/urls';
import {assertNever} from '@shared/lib/utils';

import {ThemeColor} from '@shared/types/theme';
import {NavItem} from '@shared/types/urls';

import {FlexColumn, FlexRow} from '@src/components/atoms/Flex';
import {Link} from '@src/components/atoms/Link';
import {Text} from '@src/components/atoms/Text';

const LeftSidebarItemAvatar: React.FC<{
  readonly icon: CustomIcon;
}> = ({icon}) => {
  switch (icon.type) {
    case CustomIconType.Emoji:
      return <div>{icon.emoji}</div>;
    case CustomIconType.Icon:
      return <div>{icon.iconName}</div>;
    case CustomIconType.UserFile:
      return <img src={icon.srcUrl} alt="User uploaded" />;
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
  readonly navItem: NavItem;
}> = ({navItem}) => {
  const url = Urls.forView(navItem.viewType);
  const match = useMatch(url);

  return (
    <Link to={url}>
      <LeftSideItemWrapper $isActive={!!match}>
        <LeftSidebarItemAvatar icon={navItem.icon} />
        <Text as="p">{navItem.title}</Text>
      </LeftSideItemWrapper>
    </Link>
  );
};

const LeftSidebarSection: React.FC<{
  readonly title: string;
  readonly navItems: readonly NavItem[];
}> = ({title, navItems}) => {
  return (
    <FlexColumn>
      <Text as="h5" light>
        {title}
      </Text>
      <FlexColumn style={{margin: '0 -12px'}}>
        {navItems.map((navItem) => {
          return <LeftSidebarItemComponent key={navItem.viewType} navItem={navItem} />;
        })}
      </FlexColumn>
    </FlexColumn>
  );
};

const LeftSidebarWrapper = styled(FlexColumn)`
  width: 200px;
  padding: 20px;
  background-color: ${({theme}) => theme.colors[ThemeColor.Neutral100]};
  border-right: solid 1px ${({theme}) => theme.colors[ThemeColor.Neutral300]};
  overflow: auto;
`;

export const LeftSidebar: React.FC = () => {
  return (
    <LeftSidebarWrapper>
      <LeftSidebarSection title="Views" navItems={Urls.getOrderedNavItems()} />
    </LeftSidebarWrapper>
  );
};
