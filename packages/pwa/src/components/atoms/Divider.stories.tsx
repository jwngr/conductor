import {Divider} from '@src/components/atoms/Divider';
import {P} from '@src/components/atoms/Text';
import {StorySection} from '@src/components/stories/StorySection';

export const DividerStories: React.FC = () => {
  return (
    <>
      <StorySection title="Horizontal divider (default)">
        <P>Content above</P>
        <Divider />
        <P>Content below</P>
      </StorySection>

      <StorySection title="Horizontal divider with width">
        <P>Content above</P>
        <Divider x={200} />
        <P>Content below</P>
      </StorySection>

      <StorySection title="Vertical divider">
        <div style={{height: 100, display: 'flex', alignItems: 'center'}}>
          <P>Left content</P>
          <Divider y={50} />
          <P>Right content</P>
        </div>
      </StorySection>

      <StorySection title="Box divider">
        <P>Content above</P>
        <Divider x={200} y={20} />
        <P>Content below</P>
      </StorySection>
    </>
  );
};
