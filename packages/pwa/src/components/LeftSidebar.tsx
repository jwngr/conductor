import {assertNever} from '@shared/lib/utils';
import {ViewType} from '@shared/types/query';
import React from 'react';
import {Link} from 'react-router-dom';
import styled from 'styled-components';

import {FlexColumn, FlexRow} from './atoms/Flex';
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

const LeftSidebarItemComponent: React.FC<{
  readonly item: LeftSidebarItem;
}> = ({item}) => {
  return (
    <Link to={item.url}>
      <FlexRow gap={8}>
        <LeftSidebarItemAvatar img={item.img} />
        <Text as="p">{item.name}</Text>
      </FlexRow>
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
      <Text as="h3" light>
        {title}
      </Text>
      {items.map((item) => (
        <LeftSidebarItemComponent key={item.name} item={item} />
      ))}
    </LeftSidebarSectionWrapper>
  );
};

const LeftSidebarWrapper = styled(FlexColumn)`
  width: 200px;
  padding: 20px;
`;

export const LeftSidebar: React.FC = () => {
  return (
    <LeftSidebarWrapper>
      <LeftSidebarSection
        title="Views"
        items={[
          {
            img: {
              type: CustomizableImageType.Emoji,
              emoji: '🏠',
            },
            name: 'Home',
            url: '/',
            viewType: ViewType.Inbox,
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
