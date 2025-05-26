import type React from 'react';

export const ErrorDetailsToggle: React.FC<{
  readonly error: Error;
}> = ({error}) => {
  if (!error.stack) {
    return null;
  }

  return (
    <details className="w-full">
      <summary className="text-neutral-6 hover:text-neutral-7 focus:text-neutral-7 cursor-pointer list-none text-sm outline-none select-none [&[open]]:mb-2">
        <span className="inline-block w-4 transition-transform duration-200 [details[open]_&]:rotate-90">
          ▶
        </span>
        Show technical details
      </summary>
      <pre className="bg-neutral-1 text-neutral-7 max-h-40 overflow-auto rounded-md p-3 text-xs whitespace-pre-wrap">
        {error.stack}
      </pre>
    </details>
  );
};
