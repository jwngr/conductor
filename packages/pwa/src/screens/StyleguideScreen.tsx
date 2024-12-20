import {useState} from 'react';
import styled from 'styled-components';

import {assertNever} from '@shared/lib/utils';

import {
  DEFAULT_STYLEGUIDE_STORY_GROUP_ID,
  Styleguide,
  StyleguideStoryGroupId,
} from '@shared/types/styleguide.types';
import {ThemeColor} from '@shared/types/theme.types';

import {FlexColumn, FlexRow} from '@src/components/atoms/Flex';
import {Text} from '@src/components/atoms/Text';
import {ButtonStories} from '@src/components/styleguide/Button.stories';
import {ButtonIconStories} from '@src/components/styleguide/ButtonIcon.stories';
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

const StyleguideWrapper = styled(FlexRow)`
  width: 100%;
  height: 100%;
  background-color: ${({theme}) => theme.colors[ThemeColor.Neutral100]};
`;

const StyleguideSidebarWrapper = styled(FlexColumn).attrs({gap: 20})`
  width: 240px;
  height: 100%;
  padding: 20px;
  border-right: 1px solid ${({theme}) => theme.colors[ThemeColor.Neutral300]};
`;

const StyleguideStoryGroupWrapper = styled(FlexColumn).attrs({gap: 32})`
  height: 100%;
  padding: 20px;
  overflow: auto;
`;

const SidebarCategory = styled(Text)`
  padding: 8px 12px;
  font-size: 14px;
  color: ${({theme}) => theme.colors[ThemeColor.Neutral500]};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const SidebarItem = styled(Text)<{readonly $isActive?: boolean}>`
  padding: 8px 12px 8px 24px;
  border-radius: 4px;
  cursor: pointer;
  background-color: ${({theme, $isActive}) =>
    $isActive ? theme.colors[ThemeColor.Neutral200] : 'transparent'};

  &:hover {
    background-color: ${({theme}) => theme.colors[ThemeColor.Neutral200]};
  }
`;

const StyleguideSidebarSection: React.FC<{
  readonly title: string;
  readonly sectionIds: StyleguideStoryGroupId[];
  readonly activeSectionId: StyleguideStoryGroupId;
  readonly setActiveSectionId: (sectionId: StyleguideStoryGroupId) => void;
}> = ({title, sectionIds, activeSectionId, setActiveSectionId}) => {
  return (
    <FlexColumn gap={4}>
      <SidebarCategory>{title}</SidebarCategory>
      {sectionIds.map((sectionId) => {
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
    </FlexColumn>
  );
};

const StyleguideSidebar: React.FC<{
  readonly activeSectionId: StyleguideStoryGroupId;
  readonly setActiveSectionId: (sectionId: StyleguideStoryGroupId) => void;
}> = ({activeSectionId, setActiveSectionId}) => {
  return (
    <StyleguideSidebarWrapper>
      <Text as="h2" bold>
        Styleguide
      </Text>
      <FlexColumn gap={16}>
        <StyleguideSidebarSection
          title="Atomic components"
          sectionIds={Styleguide.getOrderedAtomicComponentIds()}
          activeSectionId={activeSectionId}
          setActiveSectionId={setActiveSectionId}
        />
        <StyleguideSidebarSection
          title="Content viewers"
          sectionIds={Styleguide.getOrderedContentViewerIds()}
          activeSectionId={activeSectionId}
          setActiveSectionId={setActiveSectionId}
        />
      </FlexColumn>
    </StyleguideSidebarWrapper>
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

const StyleguideStoryGroup: React.FC<{readonly sectionId: StyleguideStoryGroupId}> = ({
  sectionId,
}) => {
  const sectionConfig = Styleguide.getSectionById(sectionId);
  return (
    <StyleguideStoryGroupWrapper>
      <Text as="h1" bold>
        {sectionConfig.title}
      </Text>
      <FlexColumn gap={40}>
        <StyleguideStoryGroupContent sectionId={sectionId} />
      </FlexColumn>
    </StyleguideStoryGroupWrapper>
  );
};

export const StyleguideScreen: React.FC = () => {
  const [activeSectionId, setActiveSectionId] = useState<StyleguideStoryGroupId>(
    DEFAULT_STYLEGUIDE_STORY_GROUP_ID
  );

  return (
    <StyleguideWrapper>
      <StyleguideSidebar
        activeSectionId={activeSectionId}
        setActiveSectionId={setActiveSectionId}
      />
      <StyleguideStoryGroup sectionId={activeSectionId} />
    </StyleguideWrapper>
  );
};
