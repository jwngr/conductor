import {Dot} from '@src/components/atoms/Dot';
import {FlexRow} from '@src/components/atoms/Flex';
import {P} from '@src/components/atoms/Text';
import {StorySection} from '@src/components/stories/StorySection';

const DotStory: React.FC<{
  readonly text: string;
  readonly size: number;
  readonly color: string;
}> = ({text, size, color}) => {
  return (
    <FlexRow gap={2}>
      <P>
        <b>{text}:</b>
      </P>
      <Dot size={size} color={color} />
    </FlexRow>
  );
};

export const DotStories: React.FC = () => {
  return (
    <>
      <StorySection title="Different sizes">
        <DotStory text="8px" size={8} color="#7D1831" />
        <DotStory text="16px" size={16} color="#7D1831" />
        <DotStory text="32px" size={32} color="#7D1831" />
      </StorySection>

      <StorySection title="Different colors">
        <DotStory text="Red" size={16} color="#FF0000" />
        <DotStory text="Green" size={16} color="#00FF00" />
        <DotStory text="Blue" size={16} color="#0000FF" />
      </StorySection>
    </>
  );
};
