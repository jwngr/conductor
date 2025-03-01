import {Markdown} from '@src/components/Markdown';
import {StorySection} from '@src/components/styleguide/StorySection';

export const MarkdownStories: React.FC = () => {
  const combinedMarkdownContent = `
# Heading 1: Main Document Title 

## Heading 2: Major Section

This is some introductory text under a major section heading. It provides context for the section.

### Heading 3: Subsection

This is content within a subsection. It goes into more detail about a specific aspect of the major section.

#### Heading 4: Minor Subsection

This level is used for even more specific categorization of content.

##### Heading 5: Detail Section

This level is rarely used but available for very detailed hierarchies.

###### Heading 6: The Smallest Heading

The smallest heading level, typically used for very specific annotations or notes.

## Text Formatting Examples

Regular text appears like this, with no special formatting applied.

**Bold text** is used to emphasize important information or key points.

_Italic text_ can be used for book titles, foreign words, or slight emphasis.

**_Bold and italic text_** combines both styles for stronger emphasis.

~~Strikethrough text~~ indicates content that is no longer relevant or has been removed.

Text can also include [hyperlinks](https://example.com) that direct users to other resources.

You can also use \`inline code\` for technical terms, commands, or code snippets within a sentence.

## Lists

### Unordered Lists

* First item in an unordered list
* Second item in an unordered list
  * Nested item under the second item
  * Another nested item
* Third item in the main list

### Ordered Lists

1. First step in a process
2. Second step in a process
   1. Sub-step one
   2. Sub-step two
3. Third step in the process

### Mixed Lists

1. First ordered item
   * Unordered sub-item
   * Another unordered sub-item
2. Second ordered item

## Block Elements

### Blockquotes

> This is a blockquote. It's often used to quote text from another source.
>
> Blockquotes can span multiple paragraphs if needed.
>
> > Nested blockquotes are also possible for showing dialogue or multiple levels of quotation.

### Code Blocks

\`\`\`typescript
// This is a code block with syntax highlighting
function greetUser(name: string): string {
  return \`Hello, \${name}! Welcome to our application.\`;
}

// Call the function
const greeting = greetUser('User');
console.log(greeting);
\`\`\`

### Horizontal Rules

The following is a horizontal rule, useful for separating content sections:

---

Content after the horizontal rule.

## Tables

| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Row 1, Col 1 | Row 1, Col 2 | Row 1, Col 3 |
| Row 2, Col 1 | Row 2, Col 2 | Row 2, Col 3 |
| Row 3, Col 1 | Row 3, Col 2 | Row 3, Col 3 |

### Aligned Tables

| Left-aligned | Center-aligned | Right-aligned |
|:-------------|:--------------:|--------------:|
| Left         | Center         | Right         |
| Aligned      | Aligned        | Aligned       |

## Advanced Markdown Features

### Task Lists

- [x] Completed task
- [ ] Incomplete task
- [x] Another completed task
- [ ] Another incomplete task

### Footnotes

Here's a sentence with a footnote reference[^1].

[^1]: This is the footnote content.

### Definition Lists

Term
: Definition for the term
: Another definition for the term

Another Term
: Definition for another term
  `;

  return (
    <StorySection title={null}>
      <Markdown content={combinedMarkdownContent} />
    </StorySection>
  );
};
