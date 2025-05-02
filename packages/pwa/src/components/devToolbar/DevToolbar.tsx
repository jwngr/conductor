import {useCallback, useEffect, useRef, useState} from 'react';

import {Urls} from '@shared/lib/urls.shared';

import type {DevToolbarSectionInfo} from '@shared/types/devToolbar.types';
import {Task} from '@shared/types/utils.types';

import {useDevToolbarStore} from '@sharedClient/stores/DevToolbarStore';

import {Link} from '@src/components/atoms/Link';
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

const DevToolbarContent: React.FC<{
  readonly onClose: Task;
}> = ({onClose}) => {
  const devToolbarSections = useDevToolbarStore((state) => state.sections);
  return (
    <div className="flex flex-col gap-4">
      {devToolbarSections.map((section) =>
        section.requiresAuth ? (
          <RequireLoggedInAccount key={section.sectionType}>
            <DevToolbarSectionComponent section={section} />
          </RequireLoggedInAccount>
        ) : (
          <DevToolbarSectionComponent key={section.sectionType} section={section} />
        )
      )}
      <div className="flex flex-col">
        <Text as="h4" bold>
          Links
        </Text>
        <Link to={Urls.forStories()} onClick={onClose}>
          <Text as="p" underline="hover">
            Design system & stories
          </Text>
        </Link>
      </div>
    </div>
  );
};

const DevToolbarSectionComponent: React.FC<{
  readonly section: DevToolbarSectionInfo;
}> = ({section}) => {
  return (
    <div className="flex flex-col gap-1">
      <Text as="h4" bold>
        {section.title}
      </Text>
      <div className="flex flex-col gap-2">{section.renderSection()}</div>
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
          ? 'bg-neutral-1 h-auto w-[300px] cursor-default rounded-xl p-4'
          : 'bg-neutral-1 h-8 w-8 cursor-pointer rounded-full p-0'
      }`}
    >
      {isOpen ? <DevToolbarContent onClose={() => setIsOpen(false)} /> : <BugEmoji />}
    </div>
  );
};
