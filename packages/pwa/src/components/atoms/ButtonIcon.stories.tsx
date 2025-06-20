import {IconName} from '@shared/types/icons.types';
import {KeyboardShortcutId} from '@shared/types/shortcuts.types';

import {toast} from '@sharedClient/lib/toasts.client';

import {ButtonIcon} from '@src/components/atoms/ButtonIcon';
import {FlexRow} from '@src/components/atoms/Flex';
import {StorySection} from '@src/components/stories/StorySection';

export const ButtonIconStories: React.FC = () => {
  const handleButtonIconClick = (): void => {
    toast('Button icon clicked');
  };

  return (
    <>
      <StorySection title="Basic button icons">
        <FlexRow gap={3}>
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
        </FlexRow>
      </StorySection>

      <StorySection title="Button icon sizes">
        <FlexRow gap={3}>
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
        </FlexRow>
      </StorySection>

      <StorySection title="Button icon colors">
        <FlexRow gap={3}>
          <ButtonIcon
            name={IconName.Star}
            size={32}
            className="text-red-2"
            tooltip="Red"
            onClick={handleButtonIconClick}
          />
          <ButtonIcon
            name={IconName.Star}
            size={32}
            className="text-green-2"
            tooltip="Green"
            onClick={handleButtonIconClick}
          />
        </FlexRow>
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
