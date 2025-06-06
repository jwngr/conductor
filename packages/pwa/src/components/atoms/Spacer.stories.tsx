import {FlexColumn, FlexRow} from '@src/components/atoms/Flex';
import {Spacer} from '@src/components/atoms/Spacer';
import {P} from '@src/components/atoms/Text';
import {StorySection} from '@src/components/stories/StorySection';

export const SpacerStories: React.FC = () => {
  return (
    <>
      <StorySection title="Horizontal spacer">
        <FlexRow className="border-3 border-cyan-200">
          <P>Left</P>
          <Spacer x={100} className="bg-orange-400" />
          <P>Right</P>
        </FlexRow>
      </StorySection>

      <StorySection title="Vertical spacer">
        <FlexColumn className="bg-cyan-200">
          <P>Top</P>
          <Spacer y={32} className="bg-orange-400" />
          <P>Bottom</P>
        </FlexColumn>
      </StorySection>

      <StorySection title="Responsive spacer">
        <FlexRow className="border-3 border-cyan-200">
          <P>Left</P>
          <Spacer x={{mobile: 32, desktop: 64}} className="bg-orange-400" />
          <P>Right (spacing decreases on mobile)</P>
        </FlexRow>
      </StorySection>

      <StorySection title="Flex spacer">
        <FlexRow className="border-3 border-cyan-200">
          <P>Left</P>
          <Spacer flex={1} className="bg-orange-400" />
          <P>Right (pushed to end)</P>
        </FlexRow>
      </StorySection>
    </>
  );
};
