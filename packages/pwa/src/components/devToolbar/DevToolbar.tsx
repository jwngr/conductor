import {useCallback, useEffect, useRef, useState} from 'react';
import {styled} from 'styled-components';

import {ThemeColor} from '@shared/types/theme.types';

import {useDevToolbarStore} from '@sharedClient/stores/DevToolbarStore';

import {FlexColumn} from '@src/components/atoms/Flex';
import {Text} from '@src/components/atoms/Text';

import {IS_DEVELOPMENT} from '@src/lib/environment.pwa';

const DevToolbarWrapper = styled.div<{readonly $isOpen: boolean}>`
  position: fixed;
  bottom: 16px;
  right: 16px;
  background-color: ${({theme}) => theme.colors[ThemeColor.Neutral100]};
  border-radius: ${({$isOpen}) => ($isOpen ? '12px' : '100%')};
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  border: 2px solid ${({theme}) => theme.colors.border};
  cursor: ${({$isOpen}) => ($isOpen ? 'default' : 'pointer')};
  width: ${({$isOpen}) => ($isOpen ? '300px' : '32px')};
  height: ${({$isOpen}) => ($isOpen ? 'auto' : '32px')};
  padding: ${({$isOpen}) => ($isOpen ? '16px' : '0')};
`;

const DevToolbarContent = styled.div<{readonly $isOpen: boolean}>`
  display: ${({$isOpen}) => ($isOpen ? 'flex' : 'none')};
  flex-direction: column;
  gap: 12px;
`;

const DevToolbarSectionWrapper = styled(FlexColumn)`
  gap: 12px;
`;

const BugEmoji = styled.span<{readonly $isOpen: boolean}>`
  display: ${({$isOpen}) => ($isOpen ? 'none' : 'block')};
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  font-size: 16px;
`;

export interface DevToolbarProps {
  readonly isVisible?: boolean;
}

export const DevToolbar: React.FC<DevToolbarProps> = ({isVisible = true}) => {
  const [isOpen, setIsOpen] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);

  const devToolbarSections = useDevToolbarStore((state) => state.sections);

  // Close the toolbar on clicks outside of it.
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (isOpen && toolbarRef.current && !toolbarRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleToolbarClick = () => {
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

  if (!IS_DEVELOPMENT || !isVisible || devToolbarSections.length === 0) return null;

  return (
    <DevToolbarWrapper ref={toolbarRef} $isOpen={isOpen} onClick={handleToolbarClick}>
      <BugEmoji $isOpen={isOpen} aria-hidden="true">
        🐛
      </BugEmoji>
      <DevToolbarContent $isOpen={isOpen}>
        {devToolbarSections.map((section) => (
          <DevToolbarSectionWrapper key={section.sectionType}>
            <Text as="h4" bold>
              {section.title}
            </Text>
            {section.renderSection()}
          </DevToolbarSectionWrapper>
        ))}
      </DevToolbarContent>
    </DevToolbarWrapper>
  );
};
