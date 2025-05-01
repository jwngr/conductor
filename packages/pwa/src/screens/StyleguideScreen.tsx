import {useState} from 'react';

import {assertNever} from '@shared/lib/utils.shared';

import {
  DEFAULT_STYLEGUIDE_STORY_GROUP_ID,
  Styleguide,
  StyleguideStoryGroupId,
} from '@shared/types/styleguide.types';

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

const SidebarItem: React.FC<{
  readonly $isActive?: boolean;
  readonly children: React.ReactNode;
  readonly onClick: () => void;
}> = ({$isActive, children, onClick}) => (
  <Text
    className={`hover:bg-neutral-2 cursor-pointer rounded px-3 py-2 pl-6 ${
      $isActive ? 'bg-neutral-2' : ''
    }`}
    onClick={onClick}
  >
    {children}
  </Text>
);

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
    case StyleguideStoryGroupId.MarkdownContentViewer:
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

export const StyleguideScreen: React.FC = () => {
  const [activeSectionId, setActiveSectionId] = useState<StyleguideStoryGroupId>(
    DEFAULT_STYLEGUIDE_STORY_GROUP_ID
  );

  const sectionConfig = Styleguide.getSectionById(activeSectionId);

  return (
    <div className="bg-neutral-1 flex h-full w-full flex-row">
      <div className="border-neutral-3 flex h-full w-[240px] flex-col gap-5 overflow-auto border-r p-5">
        <Text as="h2" bold>
          Styleguide
        </Text>
        <div className="flex flex-col gap-16">
          <div className="flex flex-col gap-4">
            <Text as="h6" light className="px-3 py-2">
              Atomic components
            </Text>
            {Styleguide.getOrderedAtomicComponentIds().map((sectionId) => {
              const section = Styleguide.getSectionById(sectionId);
              return (
                <SidebarItem
                  key={section.storyGroupId}
                  $isActive={activeSectionId === section.storyGroupId}
                  onClick={() => setActiveSectionId(section.storyGroupId)}
                >
                  {section.title}
                </SidebarItem>
              );
            })}
          </div>
          <div className="flex flex-col gap-4">
            <Text as="h6" light className="px-3 py-2">
              Content viewers
            </Text>
            {Styleguide.getOrderedContentViewerIds().map((sectionId) => {
              const section = Styleguide.getSectionById(sectionId);
              return (
                <SidebarItem
                  key={section.storyGroupId}
                  $isActive={activeSectionId === section.storyGroupId}
                  onClick={() => setActiveSectionId(section.storyGroupId)}
                >
                  {section.title}
                </SidebarItem>
              );
            })}
          </div>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-8 overflow-auto p-5">
        <Text as="h1" bold>
          {sectionConfig.title}
        </Text>
        <div className="flex flex-col gap-8">
          <StyleguideStoryGroupContent sectionId={activeSectionId} />
        </div>
      </div>
    </div>
  );
};
