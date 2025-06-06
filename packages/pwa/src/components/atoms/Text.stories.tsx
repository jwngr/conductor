import {FlexColumn, FlexRow} from '@src/components/atoms/Flex';
import {H1, H2, H3, H4, H5, H6, P, Span} from '@src/components/atoms/Text';
import {StorySection} from '@src/components/stories/StorySection';

export const TextStories: React.FC = () => {
  return (
    <>
      <StorySection title="Text elements">
        <FlexColumn gap={2}>
          <H1>Heading 1</H1>
          <H2>Heading 2</H2>
          <H3>Heading 3</H3>
          <H4>Heading 4</H4>
          <H5>Heading 5</H5>
          <H6>Heading 6</H6>
          <P>Paragraph text</P>
          <Span>Inline span text</Span>
        </FlexColumn>
      </StorySection>

      <StorySection title="Text weights">
        <FlexColumn gap={2}>
          <P>Normal weight</P>
          <P bold>Bold weight</P>
          <P weight="900">Black weight</P>
        </FlexColumn>
      </StorySection>

      <StorySection title="Text alignment">
        <FlexColumn gap={2}>
          <P align="left">Left aligned text</P>
          <P align="center">Center aligned text</P>
          <P align="right">Right aligned text</P>
        </FlexColumn>
      </StorySection>

      <StorySection title="Text colors">
        <FlexColumn gap={2}>
          <P>Default color</P>
          <P light>Light color</P>
          <P success>Success color</P>
          <P error>Error color</P>
          <P>
            DEFAULT <Span error>RED</Span> DEFAULT
          </P>
          <P className="text-purple-2">
            PURPLE <Span error>RED</Span> PURPLE
          </P>
          <P className="text-purple-2">
            PURPLE <Span success>GREEN</Span> PURPLE
          </P>
          <P light>
            LIGHT <Span>LIGHT</Span> LIGHT
          </P>
        </FlexColumn>
      </StorySection>

      <StorySection title="Text styles">
        <FlexColumn gap={2}>
          <P underline="always">Always underlined</P>
          <P underline="hover">Hover to underline</P>
          <P underline="never">Never underlined</P>
          <P monospace>Monospace font</P>
          <P truncate>This text should be truncated</P>
        </FlexColumn>
      </StorySection>

      <StorySection title="Text with flex">
        <FlexRow gap={2}>
          <P flex className="bg-cyan-1 p-2">
            {`flex={true}`}
          </P>
          <P flex={false} className="bg-purple-1 p-2">
            {`flex={false}`}
          </P>
          <P flex="auto" className="bg-green-1 p-2">
            {`flex="auto"`}
          </P>
          <P flex="initial" className="bg-blue-1 p-2">
            {`flex="initial"`}
          </P>
        </FlexRow>
      </StorySection>
    </>
  );
};
