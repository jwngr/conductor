import {FlexColumn, FlexRow} from '@src/components/atoms/Flex';
import {Text} from '@src/components/atoms/Text';
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
            <Text as="h6" light>
              Normal Typography
            </Text>
            <Text as="h1">Heading 1</Text>
            <Text as="h2">Heading 2</Text>
            <Text as="h3">Heading 3</Text>
            <Text as="h4">Heading 4</Text>
            <Text as="h5">Heading 5</Text>
            <Text as="h6">Heading 6</Text>
          </FlexColumn>

          <FlexColumn gap={2}>
            <Text as="h6" light>
              Markdown Typography
            </Text>
            <Markdown content={headingsMarkdown} />
          </FlexColumn>
        </FlexRow>
      </StorySection>

      <StorySection title="Paragraphs">
        <FlexRow gap={8} align="start">
          <FlexColumn gap={2}>
            <Text as="h6" light>
              Normal Typography
            </Text>
            <Text>Regular paragraph text</Text>
            <Text bold>Bold paragraph text</Text>
            <Text className="italic">Italic paragraph text</Text>
          </FlexColumn>

          <FlexColumn gap={2}>
            <Text as="h6" light>
              Markdown Typography
            </Text>
            <Markdown content={paragraphsMarkdown} />
          </FlexColumn>
        </FlexRow>
      </StorySection>
    </>
  );
};
