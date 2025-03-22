import type React from 'react';
import ReactMarkdown from 'react-markdown';

export const Markdown: React.FC<{
  readonly content: string;
}> = ({content}) => {
  return (
    <div className="max-w-full">
      <div className="prose prose-stone prose-base prose-img:max-w-full mx-auto max-w-[800px]">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </div>
  );
};
