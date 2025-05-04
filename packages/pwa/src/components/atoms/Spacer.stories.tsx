import {FlexColumn, FlexRow} from '@src/components/atoms/Flex';
import {Spacer} from '@src/components/atoms/Spacer';
import {Text} from '@src/components/atoms/Text';
import {StorySection} from '@src/components/stories/StorySection';

export const SpacerStories: React.FC = () => {
  return (
    <>
      <StorySection title="Horizontal spacer">
        <FlexRow className="border-3 border-cyan-200">
          <Text>Left</Text>
          <Spacer x={100} className="bg-orange-400" />
          <Text>Right</Text>
        </FlexRow>
      </StorySection>

      <StorySection title="Vertical spacer">
        <FlexColumn className="bg-cyan-200">
          <Text>Top</Text>
          <Spacer y={32} className="bg-orange-400" />
          <Text>Bottom</Text>
        </FlexColumn>
      </StorySection>

      <StorySection title="Responsive spacer">
        <FlexRow className="border-3 border-cyan-200">
          <Text>Left</Text>
          <Spacer x={{mobile: 32, desktop: 64}} className="bg-orange-400" />
          <Text>Right (spacing decreases on mobile)</Text>
        </FlexRow>
      </StorySection>

      <StorySection title="Flex spacer">
        <FlexRow className="border-3 border-cyan-200">
          <Text>Left</Text>
          <Spacer flex={1} className="bg-orange-400" />
          <Text>Right (pushed to end)</Text>
        </FlexRow>
      </StorySection>
    </>
  );
};
