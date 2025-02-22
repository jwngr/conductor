import {KeyboardShortcutId} from '@shared/types/shortcuts.types';

import {Button} from '@src/components/atoms/Button';
import {FlexRow} from '@src/components/atoms/Flex';
import {Text} from '@src/components/atoms/Text';
import {Tooltip} from '@src/components/atoms/Tooltip';
import {StorySection} from '@src/components/styleguide/StorySection';

export const TooltipStories: React.FC = () => {
  return (
    <>
      <StorySection title="Basic tooltip">
        <Tooltip trigger={<Button>Hover me</Button>} content="Basic tooltip content" />
      </StorySection>

      <StorySection title="Tooltip with custom content">
        <Tooltip
          trigger={<Button>Hover for custom content</Button>}
          content={
            <FlexRow gap={8}>
              <Text>Custom content</Text>
              <Text bold>with formatting</Text>
            </FlexRow>
          }
        />
      </StorySection>

      <StorySection title="Tooltip with keyboard shortcut">
        <Tooltip
          trigger={<Button>Hover for shortcut</Button>}
          content="Save changes"
          shortcutId={KeyboardShortcutId.ToggleSaved}
          onShortcutTrigger={() => {
            window.alert('Keyboard shortcut triggered');
          }}
        />
      </StorySection>
    </>
  );
};
