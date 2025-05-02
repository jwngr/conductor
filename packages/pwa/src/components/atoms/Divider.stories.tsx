import {Divider} from '@src/components/atoms/Divider';
import {Text} from '@src/components/atoms/Text';
import {StorySection} from '@src/components/stories/StorySection';

export const DividerStories: React.FC = () => {
  return (
    <>
      <StorySection title="Horizontal divider (default)">
        <Text>Content above</Text>
        <Divider />
        <Text>Content below</Text>
      </StorySection>

      <StorySection title="Horizontal divider with width">
        <Text>Content above</Text>
        <Divider x={200} />
        <Text>Content below</Text>
      </StorySection>

      <StorySection title="Vertical divider">
        <div style={{height: 100, display: 'flex', alignItems: 'center'}}>
          <Text>Left content</Text>
          <Divider y={50} />
          <Text>Right content</Text>
        </div>
      </StorySection>

      <StorySection title="Box divider">
        <Text>Content above</Text>
        <Divider x={200} y={20} />
        <Text>Content below</Text>
      </StorySection>
    </>
  );
};
