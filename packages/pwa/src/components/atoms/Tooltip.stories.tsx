import {KeyboardShortcutId} from '@shared/types/shortcuts.types';

import {toast} from '@sharedClient/lib/toasts.client';

import {Button} from '@src/components/atoms/Button';
import {P} from '@src/components/atoms/Text';
import {Tooltip} from '@src/components/atoms/Tooltip';
import {StorySection} from '@src/components/stories/StorySection';

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
                <P>Custom content</P>
                <P bold>with formatting</P>
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
          onShortcutTrigger={async () => {
            toast('Keyboard shortcut triggered');
          }}
        />
      </StorySection>
    </>
  );
};
