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
import {TypographyStories} from '@src/components/styleguide/Typography.stories';

const StyleguideWrapper = styled(FlexRow)`
  width: 100%;
  height: 100%;
  background-color: ${({theme}) => theme.colors[ThemeColor.Neutral100]};
`;

const StyleguideSidebar = styled(FlexColumn)`
  width: 240px;
  height: 100%;
  padding: 20px;
  border-right: 1px solid ${({theme}) => theme.colors[ThemeColor.Neutral300]};
`;

const StyleguideSectionContentWrapper = styled(FlexColumn)`
  flex: 1;
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

const StyleguideSectionContent: React.FC<{readonly sectionId: StyleguideSectionId}> = ({
  sectionId,
}) => {
  let mainContent: React.ReactNode;
  switch (sectionId) {
    case StyleguideSectionId.Typography:
      mainContent = <TypographyStories />;
      break;
    case StyleguideSectionId.Buttons:
      mainContent = <ButtonStories />;
      break;
    default:
      assertNever(sectionId);
  }

  return <StyleguideSectionContentWrapper>{mainContent}</StyleguideSectionContentWrapper>;
};

export const StyleguideScreen: React.FC = () => {
  // TODO: .
  // TODO: Add a search bar
  const [activeSectionId, setActiveSectionId] = useState<StyleguideSectionId>(
    DEFAULT_STYLEGUIDE_SECTION_ID
  );

  return (
    <StyleguideWrapper>
      <StyleguideSidebar>
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
      </StyleguideSidebar>
      <StyleguideSectionContent sectionId={activeSectionId} />
    </StyleguideWrapper>
  );
};
