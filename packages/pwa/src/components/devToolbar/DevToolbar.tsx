import {useCallback, useEffect, useRef, useState} from 'react';

import {isBooleanExperimentEnabled} from '@shared/lib/experiments.shared';

import type {DevToolbarSectionInfo} from '@shared/types/devToolbar.types';
import {ExperimentId} from '@shared/types/experiments.types';
import type {Task} from '@shared/types/utils.types';

import {useDevToolbarStore} from '@sharedClient/stores/DevToolbarStore';

import {useBooleanAccountExperiment} from '@sharedClient/hooks/experiments.hooks';

import {FlexColumn} from '@src/components/atoms/Flex';
import {Link} from '@src/components/atoms/Link';
import {H4, P} from '@src/components/atoms/Text';
import {RequireLoggedInAccount} from '@src/components/auth/RequireLoggedInAccount';

import {IS_DEVELOPMENT} from '@src/lib/environment.pwa';
import {cn} from '@src/lib/utils.pwa';

import {storiesRedirectRoute} from '@src/routes';

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
    <FlexColumn gap={4}>
      {devToolbarSections.map((section) =>
        section.requiresAuth ? (
          <RequireLoggedInAccount key={section.sectionType}>
            <DevToolbarSectionComponent section={section} />
          </RequireLoggedInAccount>
        ) : (
          <DevToolbarSectionComponent key={section.sectionType} section={section} />
        )
      )}
      <FlexColumn>
        <H4 bold>Links</H4>
        <Link to={storiesRedirectRoute.to} onClick={onClose}>
          <P underline="hover">Design system & stories</P>
        </Link>
      </FlexColumn>
    </FlexColumn>
  );
};

const DevToolbarSectionComponent: React.FC<{
  readonly section: DevToolbarSectionInfo;
}> = ({section}) => {
  return (
    <FlexColumn gap={1}>
      <H4 bold>{section.title}</H4>
      <FlexColumn gap={2}>{section.renderSection()}</FlexColumn>
    </FlexColumn>
  );
};

export const DevToolbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const debugExperiment = useBooleanAccountExperiment(ExperimentId.Debug);

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

  const shouldShowDevToolbar = IS_DEVELOPMENT || isBooleanExperimentEnabled(debugExperiment);
  if (!shouldShowDevToolbar) {
    return null;
  }

  return (
    <div
      ref={toolbarRef}
      onClick={handleToolbarClick}
      className={cn(
        'border-border fixed right-4 bottom-4 border-2 border-solid shadow-md',
        isOpen
          ? 'bg-neutral-1 h-auto w-[300px] cursor-default rounded-xl p-4'
          : 'bg-neutral-1 h-8 w-8 cursor-pointer rounded-full p-0'
      )}
    >
      {isOpen ? <DevToolbarContent onClose={() => setIsOpen(false)} /> : <BugEmoji />}
    </div>
  );
};
