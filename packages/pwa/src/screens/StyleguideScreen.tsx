import {useState} from 'react';
import styled from 'styled-components';

import {assertNever} from '@shared/lib/utils';

import {
  DEFAULT_STYLEGUIDE_SECTION_ID,
  Styleguide,
  StyleguideSectionId,
} from '@shared/types/styleguide.types';
import {ThemeColor} from '@shared/types/theme.types';

import {FlexColumn, FlexRow} from '@src/components/atoms/Flex';
import {Text} from '@src/components/atoms/Text';
import {ButtonStories} from '@src/components/styleguide/Button.stories';
import {DividerStories} from '@src/components/styleguide/Divider.stories';
import {SpacerStories} from '@src/components/styleguide/Spacer.stories';
import {ToastStories} from '@src/components/styleguide/Toast.stories';
import {TooltipStories} from '@src/components/styleguide/Tooltip.stories';
import {TypographyStories} from '@src/components/styleguide/Typography.stories';

const StyleguideWrapper = styled(FlexRow)`
  width: 100%;
  height: 100%;
  background-color: ${({theme}) => theme.colors[ThemeColor.Neutral100]};
`;

const StyleguideSidebarWrapper = styled(FlexColumn)`
  width: 240px;
  height: 100%;
  padding: 20px;
  border-right: 1px solid ${({theme}) => theme.colors[ThemeColor.Neutral300]};
`;

const StyleguideSectionContentWrapper = styled(FlexColumn).attrs({gap: 32})`
  height: 100%;
  padding: 20px;
  overflow: auto;
`;

const SidebarItem = styled(Text)<{readonly $isActive?: boolean}>`
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  background-color: ${({theme, $isActive}) =>
    $isActive ? theme.colors[ThemeColor.Neutral200] : 'transparent'};

  &:hover {
    background-color: ${({theme}) => theme.colors[ThemeColor.Neutral200]};
  }
`;

const StyleguideSidebar: React.FC<{
  readonly activeSectionId: StyleguideSectionId;
  readonly setActiveSectionId: (sectionId: StyleguideSectionId) => void;
}> = ({activeSectionId, setActiveSectionId}) => {
  return (
    <StyleguideSidebarWrapper>
      <Text as="h2" bold>
        Styleguide
      </Text>
      <FlexColumn gap={4} style={{marginTop: 20}}>
        {Styleguide.getOrderedSectionIds().map((sidebarSectionId) => (
          <SidebarItem
            key={sidebarSectionId}
            $isActive={activeSectionId === sidebarSectionId}
            onClick={() => setActiveSectionId(sidebarSectionId)}
          >
            {Styleguide.getSectionById(sidebarSectionId).name}
          </SidebarItem>
        ))}
      </FlexColumn>
    </StyleguideSidebarWrapper>
  );
};

const StyleguideSectionStoriesContent: React.FC<{readonly sectionId: StyleguideSectionId}> = ({
  sectionId,
}) => {
  switch (sectionId) {
    case StyleguideSectionId.Typography:
      return <TypographyStories />;
    case StyleguideSectionId.Buttons:
      return <ButtonStories />;
    case StyleguideSectionId.Divider:
      return <DividerStories />;
    case StyleguideSectionId.Spacer:
      return <SpacerStories />;
    case StyleguideSectionId.Toast:
      return <ToastStories />;
    case StyleguideSectionId.Tooltip:
      return <TooltipStories />;
    default:
      assertNever(sectionId);
  }
};

const StyleguideSectionContent: React.FC<{readonly sectionId: StyleguideSectionId}> = ({
  sectionId,
}) => {
  const sectionConfig = Styleguide.getSectionById(sectionId);
  return (
    <StyleguideSectionContentWrapper>
      <Text as="h1" bold>
        {sectionConfig.name}
      </Text>
      <FlexColumn gap={40}>
        <StyleguideSectionStoriesContent sectionId={sectionId} />
      </FlexColumn>
    </StyleguideSectionContentWrapper>
  );
};

export const StyleguideScreen: React.FC = () => {
  const [activeSectionId, setActiveSectionId] = useState<StyleguideSectionId>(
    DEFAULT_STYLEGUIDE_SECTION_ID
  );

  return (
    <StyleguideWrapper>
      <StyleguideSidebar
        activeSectionId={activeSectionId}
        setActiveSectionId={setActiveSectionId}
      />
      <StyleguideSectionContent sectionId={activeSectionId} />
    </StyleguideWrapper>
  );
};
