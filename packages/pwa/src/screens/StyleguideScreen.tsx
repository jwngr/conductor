import {useState} from 'react';

import {assertNever} from '@shared/lib/utils.shared';

import {
  DEFAULT_STYLEGUIDE_STORY_GROUP_ID,
  Styleguide,
  StyleguideStoryGroupId,
} from '@shared/types/styleguide.types';
import type {Consumer} from '@shared/types/utils.types';

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
  readonly sectionId: StyleguideStoryGroupId;
  readonly isActive: boolean;
  readonly onClick: () => void;
}> = ({sectionId, isActive, onClick}) => {
  const section = Styleguide.getSectionById(sectionId);

  return (
    <Text
      className={`hover:bg-neutral-2 ml-[-8px] cursor-pointer rounded p-2 ${
        isActive ? 'bg-neutral-2' : ''
      }`}
      onClick={onClick}
    >
      {section.title}
    </Text>
  );
};

const StyleguideStoryGroupContent: React.FC<{readonly sectionId: StyleguideStoryGroupId}> = ({
  sectionId,
}) => {
  switch (sectionId) {
    case StyleguideStoryGroupId.Button:
      return <ButtonStories />;
    case StyleguideStoryGroupId.ButtonIcon:
      return <ButtonIconStories />;
    case StyleguideStoryGroupId.Colors:
      return <ColorsStories />;
    case StyleguideStoryGroupId.ColorsVanilla:
      return <ColorsVanillaStories />;
    case StyleguideStoryGroupId.Dialog:
      return <DialogStories />;
    case StyleguideStoryGroupId.Divider:
      return <DividerStories />;
    case StyleguideStoryGroupId.Flex:
      return <FlexStories />;
    case StyleguideStoryGroupId.Input:
      return <InputStories />;
    case StyleguideStoryGroupId.Link:
      return <LinkStories />;
    case StyleguideStoryGroupId.MarkdownRenderer:
      return <MarkdownStories />;
    case StyleguideStoryGroupId.Spacer:
      return <SpacerStories />;
    case StyleguideStoryGroupId.TextIcon:
      return <TextIconStories />;
    case StyleguideStoryGroupId.Toast:
      return <ToastStories />;
    case StyleguideStoryGroupId.Tooltip:
      return <TooltipStories />;
    case StyleguideStoryGroupId.Typography:
      return <TypographyStories />;
    default: {
      assertNever(sectionId);
    }
  }
};

const StyleguideSidebarSection: React.FC<{
  readonly title: string;
  readonly sectionIds: StyleguideStoryGroupId[];
  readonly activeSectionId: StyleguideStoryGroupId;
  readonly onItemClick: Consumer<StyleguideStoryGroupId>;
}> = ({title, sectionIds, activeSectionId, onItemClick}) => {
  return (
    <div className="flex flex-col gap-2">
      <Text as="h6" light>
        {title}
      </Text>
      <div className="flex flex-col">
        {sectionIds.map((sectionId) => (
          <StoryGroupSidebarItem
            key={sectionId}
            sectionId={sectionId}
            isActive={activeSectionId === sectionId}
            onClick={() => onItemClick(sectionId)}
          />
        ))}
      </div>
    </div>
  );
};

const StyleguideSidebar: React.FC<{
  readonly activeSectionId: StyleguideStoryGroupId;
  readonly onItemClick: Consumer<StyleguideStoryGroupId>;
}> = ({activeSectionId, onItemClick}) => {
  return (
    <div className="border-neutral-3 flex h-full w-[240px] flex-col gap-6 overflow-auto border-r p-4">
      <StyleguideSidebarSection
        title="Design system"
        sectionIds={Styleguide.getOrderedDesignSystemIds()}
        activeSectionId={activeSectionId}
        onItemClick={onItemClick}
      />
      <StyleguideSidebarSection
        title="Atoms"
        sectionIds={Styleguide.getOrderedAtomicComponentIds()}
        activeSectionId={activeSectionId}
        onItemClick={onItemClick}
      />
      <StyleguideSidebarSection
        title="Renderers"
        sectionIds={Styleguide.getOrderedRendererIds()}
        activeSectionId={activeSectionId}
        onItemClick={onItemClick}
      />
    </div>
  );
};

const StyleguideScreenMainContent: React.FC<{
  readonly activeSectionId: StyleguideStoryGroupId;
}> = ({activeSectionId}) => {
  const sectionConfig = Styleguide.getSectionById(activeSectionId);

  return (
    <div className="flex flex-1 flex-col gap-8 overflow-auto p-4">
      <Text as="h1" bold>
        {sectionConfig.title}
      </Text>
      <StyleguideStoryGroupContent sectionId={activeSectionId} />
    </div>
  );
};

export const StyleguideScreen: React.FC = () => {
  const [activeSectionId, setActiveSectionId] = useState<StyleguideStoryGroupId>(
    DEFAULT_STYLEGUIDE_STORY_GROUP_ID
  );

  return (
    <div className="bg-neutral-1 flex h-full w-full flex-row">
      <StyleguideSidebar activeSectionId={activeSectionId} onItemClick={setActiveSectionId} />
      <StyleguideScreenMainContent activeSectionId={activeSectionId} />
    </div>
  );
};
