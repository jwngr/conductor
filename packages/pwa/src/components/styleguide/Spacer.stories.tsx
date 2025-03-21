import {Spacer} from '@src/components/atoms/Spacer';
import {Text} from '@src/components/atoms/Text';
import {StorySection} from '@src/components/styleguide/StorySection';

export const SpacerStories: React.FC = () => {
  return (
    <>
      <StorySection title="Horizontal spacer">
        <div className="flex flex-row items-center border-3 border-red-200">
          <Text>Left</Text>
          <Spacer x={100} className="bg-green-800" />
          <Text>Right</Text>
        </div>
      </StorySection>

      <StorySection title="Vertical spacer">
        <div className="flex flex-col bg-red-200">
          <Text>Top</Text>
          <Spacer y={32} className="bg-green-800" />
          <Text>Bottom</Text>
        </div>
      </StorySection>

      <StorySection title="Responsive spacer">
        <div className="flex flex-row items-center border-3 border-red-200">
          <Text>Left</Text>
          <Spacer x={{mobile: 32, desktop: 64}} className="bg-green-800" />
          <Text>Right (spacing decreases on mobile)</Text>
        </div>
      </StorySection>

      <StorySection title="Flex spacer">
        <div className="flex flex-row items-center border-3 border-red-200">
          <Text>Left</Text>
          <Spacer flex={1} className="bg-green-800" />
          <Text>Right (pushed to end)</Text>
        </div>
      </StorySection>
    </>
  );
};
