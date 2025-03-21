import {IconName} from '@shared/types/icons.types';
import {KeyboardShortcutId} from '@shared/types/shortcuts.types';
import {ThemeColor} from '@shared/types/theme.types';

import {ButtonIcon} from '@src/components/atoms/ButtonIcon';
import {StorySection} from '@src/components/styleguide/StorySection';

import {toast} from '@src/lib/toasts';

export const ButtonIconStories: React.FC = () => {
  const handleButtonIconClick = (): void => {
    toast.success('Button icon clicked');
  };

  return (
    <>
      <StorySection title="Basic button icons">
        <div className="flex flex-row items-center gap-2">
          <ButtonIcon
            name={IconName.Star}
            size={32}
            tooltip="Star"
            onClick={handleButtonIconClick}
          />
          <ButtonIcon
            name={IconName.Save}
            size={32}
            tooltip="Save"
            onClick={handleButtonIconClick}
          />
          <ButtonIcon
            name={IconName.MarkDone}
            size={32}
            tooltip="Mark Done"
            onClick={handleButtonIconClick}
          />
        </div>
      </StorySection>

      <StorySection title="Button icon sizes">
        <div className="flex flex-row items-center gap-2">
          <ButtonIcon
            name={IconName.Star}
            size={24}
            tooltip="Small"
            onClick={handleButtonIconClick}
          />
          <ButtonIcon
            name={IconName.Star}
            size={32}
            tooltip="Medium"
            onClick={handleButtonIconClick}
          />
          <ButtonIcon
            name={IconName.Star}
            size={40}
            tooltip="Large"
            onClick={handleButtonIconClick}
          />
        </div>
      </StorySection>

      <StorySection title="Button icon colors">
        <div className="flex flex-row items-center gap-2">
          <ButtonIcon
            name={IconName.Star}
            size={32}
            color={ThemeColor.Red500}
            tooltip="Red"
            onClick={handleButtonIconClick}
          />
          <ButtonIcon
            name={IconName.Star}
            size={32}
            color={ThemeColor.Green500}
            tooltip="Green"
            onClick={handleButtonIconClick}
          />
        </div>
      </StorySection>

      <StorySection title="Button icon with keyboard shortcut">
        <ButtonIcon
          name={IconName.Save}
          size={32}
          tooltip="Save changes"
          shortcutId={KeyboardShortcutId.ToggleSaved}
          onClick={handleButtonIconClick}
        />
      </StorySection>
    </>
  );
};
