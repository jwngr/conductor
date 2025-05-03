import {useNavigate, useParams} from '@tanstack/react-router';
import React from 'react';

import {
  DEFAULT_STORIES_SIDEBAR_ITEM,
  getAtomicComponentSidebarItems,
  getDesignSystemSidebarItems,
  getRendererSidebarItems,
} from '@shared/lib/stories.shared';
import {Urls} from '@shared/lib/urls.shared';
import {assertNever} from '@shared/lib/utils.shared';

import {RendererType} from '@shared/types/renderers.types';
import {
  AtomicComponentType,
  DesignSystemComponentType,
  StoriesSidebarSectionId,
} from '@shared/types/stories.types';
import type {StoriesSidebarItem} from '@shared/types/stories.types';
import type {Consumer, Task} from '@shared/types/utils.types';

import {ButtonStories} from '@src/components/atoms/Button.stories';
import {ButtonIconStories} from '@src/components/atoms/ButtonIcon.stories';
import {DialogStories} from '@src/components/atoms/Dialog.stories';
import {DividerStories} from '@src/components/atoms/Divider.stories';
import {FlexStories} from '@src/components/atoms/Flex.stories';
import {InputStories} from '@src/components/atoms/Input.stories';
import {Link} from '@src/components/atoms/Link';
import {LinkStories} from '@src/components/atoms/Link.stories';
import {SpacerStories} from '@src/components/atoms/Spacer.stories';
import {Text} from '@src/components/atoms/Text';
import {TextIconStories} from '@src/components/atoms/TextIcon.stories';
import {ToastStories} from '@src/components/atoms/Toast.stories';
import {TooltipStories} from '@src/components/atoms/Tooltip.stories';
import {MarkdownStories} from '@src/components/Markdown.stories';
import {ColorsStories} from '@src/components/stories/Colors.stories';
import {ColorsVanillaStories} from '@src/components/stories/ColorsVanilla.stories';
import {TypographyStories} from '@src/components/stories/Typography.stories';

import {storiesRoute} from '@src/routes/index';

const StoryGroupSidebarItem: React.FC<{
  readonly title: string;
  readonly isActive: boolean;
  readonly onClick: Task;
}> = ({title, isActive, onClick}) => {
  return (
    <Text
      className={`hover:bg-neutral-2 ml-[-8px] cursor-pointer rounded p-2 ${
        isActive ? 'bg-neutral-2' : ''
      }`}
      onClick={onClick}
    >
      {title}
    </Text>
  );
};

const AtomicComponentStoryContent: React.FC<{
  readonly atomicComponentType: AtomicComponentType;
}> = ({atomicComponentType}) => {
  switch (atomicComponentType) {
    case AtomicComponentType.Button:
      return <ButtonStories />;
    case AtomicComponentType.ButtonIcon:
      return <ButtonIconStories />;
    case AtomicComponentType.Dialog:
      return <DialogStories />;
    case AtomicComponentType.Divider:
      return <DividerStories />;
    case AtomicComponentType.Flex:
      return <FlexStories />;
    case AtomicComponentType.Input:
      return <InputStories />;
    case AtomicComponentType.Link:
      return <LinkStories />;
    case AtomicComponentType.Spacer:
      return <SpacerStories />;
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
    <div className="flex flex-col gap-2">
      <Text as="h6" light>
        {title}
      </Text>
      <div className="flex flex-col">
        {items.map((item) => (
          <StoryGroupSidebarItem
            key={item.title}
            title={item.title}
            isActive={activeSidebarItem.sidebarItemId === item.sidebarItemId}
            onClick={() => onItemClick(item)}
          />
        ))}
      </div>
    </div>
  );
};

const StoriesSidebar: React.FC<{
  readonly activeSidebarItem: StoriesSidebarItem;
  readonly onItemClick: Consumer<StoriesSidebarItem>;
}> = ({activeSidebarItem, onItemClick}) => {
  return (
    <div className="border-neutral-3 flex h-full w-[240px] flex-col gap-6 overflow-auto border-r p-4 pt-2">
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
    </div>
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
    <div className="flex flex-1 flex-col gap-8 overflow-auto p-4">
      <Text as="h1" bold>
        {activeSidebarItem.title}
      </Text>
      {mainContent}
    </div>
  );
};

const findSidebarItem = (
  storiesSidebarSectionId: StoriesSidebarSectionId,
  sidebarItemId: string
): StoriesSidebarItem | null => {
  const allItems = [
    ...getDesignSystemSidebarItems(),
    ...getAtomicComponentSidebarItems(),
    ...getRendererSidebarItems(),
  ];

  return (
    allItems.find(
      (item) =>
        item.sidebarSectionId === storiesSidebarSectionId && item.sidebarItemId === sidebarItemId
    ) ?? null
  );
};

export const StoriesScreen: React.FC = () => {
  const navigate = useNavigate();
  const {storiesSidebarSectionId, sidebarItemId} = storiesRoute.useParams();

  // If no parameters are provided, use the default item
  const selectedSidebarItem = storiesSidebarSectionId
    ? (findSidebarItem(storiesSidebarSectionId, sidebarItemId) ?? DEFAULT_STORIES_SIDEBAR_ITEM)
    : DEFAULT_STORIES_SIDEBAR_ITEM;

  // If we're at /ui or if no sidebar item is found, navigate to the default one
  React.useEffect(() => {
    if (!storiesSidebarSectionId || !selectedSidebarItem) {
      void navigate({to: Urls.forStories(DEFAULT_STORIES_SIDEBAR_ITEM)});
    }
  }, [navigate, selectedSidebarItem, storiesSidebarSectionId]);

  const handleSidebarItemClick = (item: StoriesSidebarItem): void => {
    void navigate({to: Urls.forStories(item)});
  };

  return (
    <div className="bg-neutral-1 flex h-full w-full flex-row">
      <div className="border-neutral-3 flex h-full w-[240px] flex-col border-r">
        <div className="py-2 pl-4">
          <Link to="/">
            <Text as="p" underline="hover" light>
              ← Back to app
            </Text>
          </Link>
        </div>
        <StoriesSidebar
          activeSidebarItem={selectedSidebarItem}
          onItemClick={handleSidebarItemClick}
        />
      </div>
      <StoriesScreenMainContent activeSidebarItem={selectedSidebarItem} />
    </div>
  );
};
