import React from 'react';
import ReactMarkdown from 'react-markdown';
import styled from 'styled-components';

const MarkdownWrapper = styled.div`
  border: solid 5px green;
  max-width: 100%;

  img {
    max-width: 100%;
  }
`;

interface MarkdownProps {
  readonly content: string;
}

export const Markdown: React.FC<MarkdownProps> = ({content}) => {
  return (
    <MarkdownWrapper>
      <ReactMarkdown>{content}</ReactMarkdown>
    </MarkdownWrapper>
  );
};
