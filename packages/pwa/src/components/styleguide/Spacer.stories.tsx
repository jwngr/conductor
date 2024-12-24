import styled from 'styled-components';

import {ThemeColor} from '@shared/types/theme.types';

import {FlexColumn, FlexRow} from '@src/components/atoms/Flex';
import {Spacer} from '@src/components/atoms/Spacer';
import {Text} from '@src/components/atoms/Text';
import {StorySection} from '@src/components/styleguide/StorySection';

const FlexRowStoryWrapper = styled(FlexRow)`
  border: solid 3px ${({theme}) => theme.colors[ThemeColor.Red200]};
`;

const FlexColumnStoryWrapper = styled(FlexColumn)`
  background-color: ${({theme}) => theme.colors[ThemeColor.Red200]};
`;

const SpacerWrapper = styled(Spacer)`
  background-color: ${({theme}) => theme.colors[ThemeColor.Green700]};
`;

export const SpacerStories: React.FC = () => {
  return (
    <>
      <StorySection title="Horizontal spacer">
        <FlexRowStoryWrapper>
          <Text>Left</Text>
          <SpacerWrapper x={100} />
          <Text>Right</Text>
        </FlexRowStoryWrapper>
      </StorySection>

      <StorySection title="Vertical spacer">
        <FlexColumnStoryWrapper>
          <Text>Top</Text>
          <SpacerWrapper y={32} />
          <Text>Bottom</Text>
        </FlexColumnStoryWrapper>
      </StorySection>

      <StorySection title="Responsive spacer">
        <FlexRowStoryWrapper>
          <Text>Left</Text>
          <SpacerWrapper x={{mobile: 16, desktop: 64}} />
          <Text>Right (spacing decreases on mobile)</Text>
        </FlexRowStoryWrapper>
      </StorySection>

      <StorySection title="Flex spacer">
        <FlexRowStoryWrapper>
          <Text>Left</Text>
          <SpacerWrapper flex={1} />
          <Text>Right (pushed to end)</Text>
        </FlexRowStoryWrapper>
      </StorySection>
    </>
  );
};
