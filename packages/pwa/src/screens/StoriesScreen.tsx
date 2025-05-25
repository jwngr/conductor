import {useNavigate} from '@tanstack/react-router';
import type React from 'react';

import {DEFAULT_NAV_ITEM} from '@shared/lib/navItems.shared';
import {
  DEFAULT_STORIES_SIDEBAR_ITEM,
  getAtomicComponentSidebarItems,
  getDesignSystemSidebarItems,
  getRendererSidebarItems,
} from '@shared/lib/stories.shared';
import {assertNever} from '@shared/lib/utils.shared';

import {RendererType} from '@shared/types/renderers.types';
import {
  AtomicComponentType,
  DesignSystemComponentType,
  StoriesSidebarSectionId,
} from '@shared/types/stories.types';
import type {StoriesSidebarItem} from '@shared/types/stories.types';
import type {Consumer} from '@shared/types/utils.types';

import {BadgeStories} from '@src/components/atoms/Badge.stories';
import {ButtonStories} from '@src/components/atoms/Button.stories';
import {ButtonIconStories} from '@src/components/atoms/ButtonIcon.stories';
import {CheckboxStories} from '@src/components/atoms/Checkbox.stories';
import {DialogStories} from '@src/components/atoms/Dialog.stories';
import {DividerStories} from '@src/components/atoms/Divider.stories';
import {DropdownMenuStories} from '@src/components/atoms/DropdownMenu.stories';
import {FlexColumn, FlexRow} from '@src/components/atoms/Flex';
import {FlexStories} from '@src/components/atoms/Flex.stories';
import {IconStories} from '@src/components/atoms/Icon.stories';
import {InputStories} from '@src/components/atoms/Input.stories';
import {LinkStories} from '@src/components/atoms/Link.stories';
import {SpacerStories} from '@src/components/atoms/Spacer.stories';
import {Text} from '@src/components/atoms/Text';
import {TextStories} from '@src/components/atoms/Text.stories';
import {TextIconStories} from '@src/components/atoms/TextIcon.stories';
import {ToastStories} from '@src/components/atoms/Toast.stories';
import {TooltipStories} from '@src/components/atoms/Tooltip.stories';
import {MarkdownStories} from '@src/components/Markdown.stories';
import {NavItemLink} from '@src/components/nav/NavItemLink';
import {ColorsStories} from '@src/components/stories/Colors.stories';
import {ColorsVanillaStories} from '@src/components/stories/ColorsVanilla.stories';
import {TypographyStories} from '@src/components/stories/Typography.stories';

import {useSelectedStoryFromUrl} from '@src/lib/router.pwa';

import {storiesRoute} from '@src/routes/index';
import * as styles from '@src/screens/StoriesScreen.css';

const AtomicComponentStoryContent: React.FC<{
  readonly atomicComponentType: AtomicComponentType;
}> = ({atomicComponentType}) => {
  switch (atomicComponentType) {
    case AtomicComponentType.Badge:
      return <BadgeStories />;
    case AtomicComponentType.Button:
      return <ButtonStories />;
    case AtomicComponentType.ButtonIcon:
      return <ButtonIconStories />;
    case AtomicComponentType.Checkbox:
      return <CheckboxStories />;
    case AtomicComponentType.Dialog:
      return <DialogStories />;
    case AtomicComponentType.Divider:
      return <DividerStories />;
    case AtomicComponentType.DropdownMenu:
      return <DropdownMenuStories />;
    case AtomicComponentType.Flex:
      return <FlexStories />;
    case AtomicComponentType.Input:
      return <InputStories />;
    case AtomicComponentType.Link:
      return <LinkStories />;
    case AtomicComponentType.Spacer:
      return <SpacerStories />;
    case AtomicComponentType.Text:
      return <TextStories />;
    case AtomicComponentType.TextIcon:
      return <TextIconStories />;
    case AtomicComponentType.Toast:
      return <ToastStories />;
    case AtomicComponentType.Tooltip:
      return <TooltipStories />;
    default: {
      assertNever(atomicComponentType);
    }
  }
};

const DesignSystemStoryContent: React.FC<{
  readonly designSystemType: DesignSystemComponentType;
}> = ({designSystemType}) => {
  switch (designSystemType) {
    case DesignSystemComponentType.Colors:
      return <ColorsStories />;
    case DesignSystemComponentType.ColorsVanilla:
      return <ColorsVanillaStories />;
    case DesignSystemComponentType.Typography:
      return <TypographyStories />;
    case DesignSystemComponentType.Icons:
      return <IconStories />;
    default: {
      assertNever(designSystemType);
    }
  }
};

const RendererStoryContent: React.FC<{readonly rendererType: RendererType}> = ({rendererType}) => {
  switch (rendererType) {
    case RendererType.Markdown:
      return <MarkdownStories />;
    default: {
      assertNever(rendererType);
    }
  }
};

const SidebarSection: React.FC<{
  readonly title: string;
  readonly items: StoriesSidebarItem[];
  readonly activeSidebarItem: StoriesSidebarItem;
  readonly onItemClick: Consumer<StoriesSidebarItem>;
}> = ({title, items, activeSidebarItem, onItemClick}) => {
  return (
    <FlexColumn gap={2}>
      <Text as="h6" light>
        {title}
      </Text>
      <FlexColumn>
        {items.map((item) => (
          <Text
            key={item.title}
            className={styles.storyGroupSidebarItem({
              isActive: activeSidebarItem.sidebarItemId === item.sidebarItemId,
            })}
            onClick={() => onItemClick(item)}
          >
            {item.title}
          </Text>
        ))}
      </FlexColumn>
    </FlexColumn>
  );
};

const StoriesLeftSidebar: React.FC<{
  readonly activeSidebarItem: StoriesSidebarItem;
  readonly onItemClick: Consumer<StoriesSidebarItem>;
}> = ({activeSidebarItem, onItemClick}) => {
  return (
    <FlexColumn overflow="auto" className={styles.storiesLeftSidebar}>
      <div className="pt-4 pl-4">
        <NavItemLink navItemId={DEFAULT_NAV_ITEM.id}>
          <Text as="p" underline="hover" light>
            ← Back to app
          </Text>
        </NavItemLink>
      </div>
      <FlexColumn flex={1} gap={6} padding={4}>
        <SidebarSection
          title="Design system"
          items={getDesignSystemSidebarItems()}
          activeSidebarItem={activeSidebarItem}
          onItemClick={onItemClick}
        />
        <SidebarSection
          title="Atoms"
          items={getAtomicComponentSidebarItems()}
          activeSidebarItem={activeSidebarItem}
          onItemClick={onItemClick}
        />
        <SidebarSection
          title="Renderers"
          items={getRendererSidebarItems()}
          activeSidebarItem={activeSidebarItem}
          onItemClick={onItemClick}
        />
      </FlexColumn>
    </FlexColumn>
  );
};

const StoriesScreenMainContent: React.FC<{
  readonly activeSidebarItem: StoriesSidebarItem;
}> = ({activeSidebarItem}) => {
  let mainContent: React.ReactNode;
  switch (activeSidebarItem.sidebarSectionId) {
    case StoriesSidebarSectionId.DesignSystem:
      mainContent = <DesignSystemStoryContent designSystemType={activeSidebarItem.sidebarItemId} />;
      break;
    case StoriesSidebarSectionId.AtomicComponents:
      mainContent = (
        <AtomicComponentStoryContent atomicComponentType={activeSidebarItem.sidebarItemId} />
      );
      break;
    case StoriesSidebarSectionId.Renderers:
      mainContent = <RendererStoryContent rendererType={activeSidebarItem.sidebarItemId} />;
      break;
    default: {
      assertNever(activeSidebarItem);
    }
  }

  return (
    <FlexColumn
      flex={1}
      gap={8}
      padding={4}
      overflow="auto"
      className={styles.storiesScreenMainContent}
    >
      <Text as="h1" bold>
        {activeSidebarItem.title}
      </Text>
      {mainContent}
    </FlexColumn>
  );
};

export const StoriesScreen: React.FC = () => {
  const navigate = useNavigate();

  const sidebarItemIdFromUrl = useSelectedStoryFromUrl();
  const selectedSidebarItem = sidebarItemIdFromUrl ?? DEFAULT_STORIES_SIDEBAR_ITEM;

  const handleSidebarItemClick = (item: StoriesSidebarItem): void => {
    void navigate({
      to: storiesRoute.fullPath,
      params: {sidebarItemId: item.sidebarItemId},
    });
  };

  return (
    <FlexRow overflow="hidden" className={styles.storiesScreen}>
      <StoriesLeftSidebar
        activeSidebarItem={selectedSidebarItem}
        onItemClick={handleSidebarItemClick}
      />
      <StoriesScreenMainContent activeSidebarItem={selectedSidebarItem} />
    </FlexRow>
  );
};
