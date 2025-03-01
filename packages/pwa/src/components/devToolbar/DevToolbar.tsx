import {useCallback, useEffect, useRef, useState} from 'react';

import type {DevToolbarSectionInfo} from '@shared/types/devToolbar.types';

import {useDevToolbarStore} from '@sharedClient/stores/DevToolbarStore';

import {Text} from '@src/components/atoms/Text';
import {RequireLoggedInAccount} from '@src/components/auth/RequireLoggedInAccount';

const BugEmoji: React.FC = () => {
  return (
    <span
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-base"
      aria-hidden="true"
    >
      🐛
    </span>
  );
};

const DevToolbarContent: React.FC = () => {
  const devToolbarSections = useDevToolbarStore((state) => state.sections);
  return (
    <div className="flex flex-col gap-3">
      {devToolbarSections.map((section) =>
        section.requiresAuth ? (
          <RequireLoggedInAccount key={section.sectionType}>
            <DevToolbarSectionComponent section={section} />
          </RequireLoggedInAccount>
        ) : (
          <DevToolbarSectionComponent key={section.sectionType} section={section} />
        )
      )}
    </div>
  );
};

const DevToolbarSectionComponent: React.FC<{
  readonly section: DevToolbarSectionInfo;
}> = ({section}) => {
  return (
    <div className="flex flex-col gap-3">
      <Text as="h4" bold>
        {section.title}
      </Text>
      {section.renderSection()}
    </div>
  );
};

export const DevToolbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);

  // Close the toolbar on clicks outside of it.
  useEffect(() => {
    function handleClickOutside(event: MouseEvent): void {
      if (isOpen && toolbarRef.current && !toolbarRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleToolbarClick = (): void => {
    if (!isOpen) {
      setIsOpen(true);
    }
  };

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    },
    [isOpen]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // TODO: Add `!IS_DEVELOPMENT` check back here.

  return (
    <div
      ref={toolbarRef}
      onClick={handleToolbarClick}
      className={`border-border fixed right-4 bottom-4 border-2 border-solid shadow-md ${
        isOpen
          ? 'h-auto w-[300px] cursor-default rounded-xl bg-neutral-100 p-4'
          : 'h-8 w-8 cursor-pointer rounded-full bg-neutral-100 p-0'
      }`}
    >
      {isOpen ? <DevToolbarContent /> : <BugEmoji />}
    </div>
  );
};
