import {Markdown} from '@src/components/Markdown';
import {StorySection} from '@src/components/styleguide/StorySection';

export const MarkdownStories: React.FC = () => {
  return (
    <>
      <StorySection title="Plain text">
        <Markdown content="Hello, world!" />
        <Markdown content="## Hello, world!" />
      </StorySection>

      <StorySection title="Headers">
        <Markdown content="# H1" />
        <Markdown content="## H2" />
        <Markdown content="### H3" />
        <Markdown content="#### H4" />
        <Markdown content="##### H5" />
        <Markdown content="###### H6" />
      </StorySection>

      <StorySection title="Lists">
        <Markdown content="* List item 1" />
        <Markdown content="* List item 2" />
        <Markdown content="* List item 3" />
      </StorySection>

      <StorySection title="Links">
        <Markdown content="[Link](https://www.google.com)" />
      </StorySection>

      <StorySection title="Blockquotes">
        <Markdown content="> Blockquote" />
      </StorySection>

      <StorySection title="Code">
        <Markdown content="Some `inline` code" />
        <Markdown content="```A code block```" />
      </StorySection>

      <StorySection title="Horizontal rules">
        <Markdown content="---" />
      </StorySection>
    </>
  );
};
