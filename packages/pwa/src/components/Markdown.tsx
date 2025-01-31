import type React from 'react';
import ReactMarkdown from 'react-markdown';
import styled from 'styled-components';

const MarkdownFullWidthWrapper = styled.div`
  max-width: 100%;
`;

const MarkdownContentWrapper = styled.div`
  max-width: 960px;
  margin: auto;

  // Reset spacing back to default (these are set to 0 in global styles).
  * {
    margin: revert;
    padding: revert;
  }

  img {
    max-width: 100%;
  }
`;

export const Markdown: React.FC<{
  readonly content: string;
}> = ({content}) => {
  return (
    <MarkdownFullWidthWrapper>
      <MarkdownContentWrapper>
        <ReactMarkdown>{content}</ReactMarkdown>
      </MarkdownContentWrapper>
    </MarkdownFullWidthWrapper>
  );
};
