import React from 'react';
import styled from 'styled-components';

import type {CustomIcon} from '@shared/lib/customIcons.shared';
import {CustomIconType, makeSystemIcon} from '@shared/lib/customIcons.shared';
import {Urls} from '@shared/lib/urls.shared';
import {assertNever} from '@shared/lib/utils.shared';

import {IconName} from '@shared/types/icons.types';
import {ThemeColor} from '@shared/types/theme.types';
import type {NavItem} from '@shared/types/urls.types';
import type {Task} from '@shared/types/utils.types';

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
  readonly onSelect?: Task;
}> = ({url, icon, title, isActive, onSelect}) => {
  return (
    <Link to={url} onClick={() => onSelect?.()}>
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
  const {focusedViewType} = useFocusStore();
  return (
    <FlexColumn>
      <Text as="h5" light>
        {title}
      </Text>
      <FlexColumn style={{margin: '0 -12px'}}>
        {navItems.map((navItem) => {
          const url = Urls.forView(navItem.viewType);
          return (
            <LeftSidebarItemComponent
              key={navItem.viewType}
              url={url}
              icon={navItem.icon}
              title={navItem.title}
              isActive={focusedViewType === navItem.viewType}
            />
          );
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
  const {setFocusedViewType} = useFocusStore();

  return (
    <LeftSidebarWrapper>
      <LeftSidebarSection title="Views" navItems={Urls.getOrderedNavItems()} />
      <div>
        <LeftSidebarItemComponent
          url={Urls.forFeedSubscriptions()}
          // TODO: Choose a better icon.
          icon={makeSystemIcon(IconName.Save)}
          title="Feeds"
          isActive={false}
          onSelect={() => setFocusedViewType(null)}
        />
      </div>
    </LeftSidebarWrapper>
  );
};
