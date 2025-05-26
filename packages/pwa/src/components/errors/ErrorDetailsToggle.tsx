import type React from 'react';
import {useState} from 'react';

import {Text} from '@src/components/atoms/Text';

import {cn} from '@src/lib/utils.pwa';

export const ErrorDetailsToggle: React.FC<{
  readonly error: Error;
}> = ({error}) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!error.stack) {
    return null;
  }

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex w-full items-center gap-2 rounded-md p-2 text-left text-sm outline-none',
          'text-neutral-6 hover:text-neutral-7 focus-visible:text-neutral-7',
          'hover:bg-neutral-1 focus-visible:bg-neutral-1',
          'transition-colors duration-200'
        )}
        aria-expanded={isOpen}
        aria-controls="error-details-content"
      >
        <span
          className={cn(
            'inline-block text-xs transition-transform duration-200',
            isOpen && 'rotate-90'
          )}
        >
          ▶
        </span>
        <Text as="span">Show technical details</Text>
      </button>

      <div
        id="error-details-content"
        className={cn(
          'overflow-hidden transition-all duration-200 ease-in-out',
          isOpen ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'
        )}
        aria-hidden={!isOpen}
      >
        <pre
          className={cn(
            'bg-neutral-1 text-neutral-7 mt-2 rounded-md p-3 text-xs',
            'max-h-60 overflow-auto whitespace-pre'
          )}
        >
          {error.stack}
        </pre>
      </div>
    </div>
  );
};
