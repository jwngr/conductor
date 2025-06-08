import {FlexColumn, FlexRow} from '@src/components/atoms/Flex';
import {H1, H2, H3, H4, H5, H6, P} from '@src/components/atoms/Text';
import {Markdown} from '@src/components/Markdown';
import {StorySection} from '@src/components/stories/StorySection';

export const TypographyStories: React.FC = () => {
  // Sample markdown content for headings and paragraphs
  const headingsMarkdown = `
# Heading 1
## Heading 2
### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6
  `;

  const paragraphsMarkdown = `
Regular paragraph text

**Bold paragraph text**

_Italic paragraph text_
  `;

  return (
    <>
      <StorySection title="Headings">
        <FlexRow gap={8} align="start">
          <FlexColumn gap={2}>
            <H6 light>Normal Typography</H6>
            <H1>Heading 1</H1>
            <H2>Heading 2</H2>
            <H3>Heading 3</H3>
            <H4>Heading 4</H4>
            <H5>Heading 5</H5>
            <H6>Heading 6</H6>
          </FlexColumn>

          <FlexColumn gap={2}>
            <H6 light>Markdown Typography</H6>
            <Markdown content={headingsMarkdown} />
          </FlexColumn>
        </FlexRow>
      </StorySection>

      <StorySection title="Paragraphs">
        <FlexRow gap={8} align="start">
          <FlexColumn gap={2}>
            <H6 light>Normal Typography</H6>
            <P>Regular paragraph text</P>
            <P bold>Bold paragraph text</P>
            <P italic>Italic paragraph text</P>
          </FlexColumn>

          <FlexColumn gap={2}>
            <H6 light>Markdown Typography</H6>
            <Markdown content={paragraphsMarkdown} />
          </FlexColumn>
        </FlexRow>
      </StorySection>
    </>
  );
};
