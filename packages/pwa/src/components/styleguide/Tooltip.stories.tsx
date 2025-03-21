import {KeyboardShortcutId} from '@shared/types/shortcuts.types';

import {Button} from '@src/components/atoms/Button';
import {Text} from '@src/components/atoms/Text';
import {Tooltip} from '@src/components/atoms/Tooltip';
import {StorySection} from '@src/components/styleguide/StorySection';

export const TooltipStories: React.FC = () => {
  return (
    <>
      <StorySection title="Basic tooltips">
        <div className="flex flex-row items-center gap-2">
          <Tooltip content="This is a tooltip" trigger={<Button>Hover me</Button>} />
          <Tooltip
            trigger={<Button>Hover for custom content</Button>}
            content={
              <div className="flex flex-row items-center gap-2">
                <Text>Custom content</Text>
                <Text bold>with formatting</Text>
              </div>
            }
          />
        </div>
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
