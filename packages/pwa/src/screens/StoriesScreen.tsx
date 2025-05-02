import {useState} from 'react';

import {
  DEFAULT_STYLEGUIDE_SIDEBAR_ITEM,
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
} from '@shared/types/styleguide.types';
import type {StoriesSidebarItem} from '@shared/types/styleguide.types';
import type {Consumer, Task} from '@shared/types/utils.types';

import {Text} from '@src/components/atoms/Text';
import {MarkdownStories} from '@src/components/Markdown.stories';
import {ButtonStories} from '@src/components/styleguide/Button.stories';
import {ButtonIconStories} from '@src/components/styleguide/ButtonIcon.stories';
import {ColorsStories} from '@src/components/styleguide/Colors.stories';
import {ColorsVanillaStories} from '@src/components/styleguide/ColorsVanilla.stories';
import {DialogStories} from '@src/components/styleguide/Dialog.stories';
import {DividerStories} from '@src/components/styleguide/Divider.stories';
import {FlexStories} from '@src/components/styleguide/Flex.stories';
import {InputStories} from '@src/components/styleguide/Input.stories';
import {LinkStories} from '@src/components/styleguide/Link.stories';
import {SpacerStories} from '@src/components/styleguide/Spacer.stories';
import {TextIconStories} from '@src/components/styleguide/TextIcon.stories';
import {ToastStories} from '@src/components/styleguide/Toast.stories';
import {TooltipStories} from '@src/components/styleguide/Tooltip.stories';
import {TypographyStories} from '@src/components/styleguide/Typography.stories';

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
    <div className="border-neutral-3 flex h-full w-[240px] flex-col gap-6 overflow-auto border-r p-4">
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
  switch (activeSidebarItem.type) {
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

export const StoriesScreen: React.FC = () => {
  const [selectedSidebarItem, setSelectedSidebarItem] = useState<StoriesSidebarItem>(
    DEFAULT_STYLEGUIDE_SIDEBAR_ITEM
  );

  return (
    <div className="bg-neutral-1 flex h-full w-full flex-row">
      <StoriesSidebar
        activeSidebarItem={selectedSidebarItem}
        onItemClick={setSelectedSidebarItem}
      />
      <StoriesScreenMainContent activeSidebarItem={selectedSidebarItem} />
    </div>
  );
};
