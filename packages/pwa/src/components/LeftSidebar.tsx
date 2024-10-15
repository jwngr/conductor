import React from 'react';
import styled from 'styled-components';

import {assertNever} from '@shared/lib/utils';
import {ViewType} from '@shared/types/query';
import {ThemeColor} from '@shared/types/theme';

import {FlexColumn, FlexRow} from './atoms/Flex';
import {Link} from './atoms/Link';
import {Text} from './atoms/Text';

enum CustomizableImageType {
  Emoji = 'emoji',
  Icon = 'icon',
  UserFile = 'userFile',
}

interface Emoji {
  readonly type: CustomizableImageType.Emoji;
  readonly emoji: string;
}

interface Icon {
  readonly type: CustomizableImageType.Icon;
  readonly iconName: string;
}

interface UserFile {
  readonly type: CustomizableImageType.UserFile;
  readonly srcUrl: string;
}

type CustomizableImage = Emoji | Icon | UserFile;

interface LeftSidebarItem {
  readonly img: CustomizableImage;
  readonly name: string;
  readonly url: string; // TODO: Introduce a `NavigationUrl` type for this.
  readonly viewType: ViewType;
}

const LeftSidebarItemAvatar: React.FC<{
  readonly img: CustomizableImage;
}> = ({img}) => {
  switch (img.type) {
    case CustomizableImageType.Emoji:
      return <div>{img.emoji}</div>;
    case CustomizableImageType.Icon:
      return <div>{img.iconName}</div>;
    case CustomizableImageType.UserFile:
      return <img src={img.srcUrl} alt="User uploaded" />;
    default:
      assertNever(img);
  }
};

const LeftSideItemWrapper = styled(FlexRow).attrs({gap: 8})`
  padding: 8px 12px;
  border-radius: 4px;

  &:hover {
    background-color: ${({theme}) => theme.colors[ThemeColor.Neutral200]};
  }

  // Animate on click.
  transition: transform 0.1s ease-in-out;
  &:active {
    transform: scale(0.95);
  }
`;

const LeftSidebarItemComponent: React.FC<{
  readonly item: LeftSidebarItem;
}> = ({item}) => {
  return (
    <Link to={item.url}>
      <LeftSideItemWrapper>
        <LeftSidebarItemAvatar img={item.img} />
        <Text as="p">{item.name}</Text>
      </LeftSideItemWrapper>
    </Link>
  );
};

const LeftSidebarSectionWrapper = styled(FlexColumn)``;

const LeftSidebarSection: React.FC<{
  readonly title: string;
  readonly items: readonly LeftSidebarItem[];
}> = ({title, items}) => {
  return (
    <LeftSidebarSectionWrapper>
      <Text as="h5" light>
        {title}
      </Text>
      <FlexColumn style={{margin: '0 -12px'}}>
        {items.map((item) => (
          <LeftSidebarItemComponent key={item.name} item={item} />
        ))}
      </FlexColumn>
    </LeftSidebarSectionWrapper>
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
      <LeftSidebarSection
        title="Views"
        items={[
          // TODO: Move these into `/shared`.
          {
            img: {
              type: CustomizableImageType.Emoji,
              emoji: '🏠',
            },
            name: 'Home',
            url: '/',
            viewType: ViewType.Untriaged,
          },
          {
            img: {
              type: CustomizableImageType.Emoji,
              emoji: '💾',
            },
            name: 'Saved',
            url: '/saved',
            viewType: ViewType.Saved,
          },
          {
            img: {
              type: CustomizableImageType.Emoji,
              emoji: '✅',
            },
            name: 'Done',
            url: '/done',
            viewType: ViewType.Done,
          },
          {
            img: {
              type: CustomizableImageType.Emoji,
              emoji: '📰',
            },
            name: 'Unread',
            url: '/unread',
            viewType: ViewType.Unread,
          },
          {
            img: {
              type: CustomizableImageType.Emoji,
              emoji: '⭐️',
            },
            name: 'Starred',
            url: '/starred',
            viewType: ViewType.Starred,
          },
          {
            img: {
              type: CustomizableImageType.Emoji,
              emoji: '📚',
            },
            name: 'All',
            url: '/all',
            viewType: ViewType.All,
          },
        ]}
      />
    </LeftSidebarWrapper>
  );
};
