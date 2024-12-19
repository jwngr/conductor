import {IconName} from '@shared/types/icons.types';
import {KeyboardShortcutId} from '@shared/types/shortcuts.types';
import {ThemeColor} from '@shared/types/theme.types';

import {ButtonIcon} from '@src/components/atoms/ButtonIcon';
import {FlexRow} from '@src/components/atoms/Flex';
import {StorySection} from '@src/components/styleguide/StorySection';

export const ButtonIconStories: React.FC = () => {
  return (
    <>
      <StorySection title="Basic button icons">
        <FlexRow gap={8}>
          <ButtonIcon
            name={IconName.Star}
            size={32}
            tooltip="Star"
            onClick={() => {
              // Intentionally empty for demo purposes
            }}
          />
          <ButtonIcon
            name={IconName.Save}
            size={32}
            tooltip="Save"
            onClick={() => {
              // Intentionally empty for demo purposes
            }}
          />
          <ButtonIcon
            name={IconName.MarkDone}
            size={32}
            tooltip="Mark as done"
            onClick={() => {
              // Intentionally empty for demo purposes
            }}
          />
        </FlexRow>
      </StorySection>

      <StorySection title="Button icon sizes">
        <FlexRow gap={8} align="center">
          <ButtonIcon
            name={IconName.Star}
            size={24}
            tooltip="Small"
            onClick={() => {
              // Intentionally empty for demo purposes
            }}
          />
          <ButtonIcon
            name={IconName.Star}
            size={32}
            tooltip="Medium"
            onClick={() => {
              // Intentionally empty for demo purposes
            }}
          />
          <ButtonIcon
            name={IconName.Star}
            size={40}
            tooltip="Large"
            onClick={() => {
              // Intentionally empty for demo purposes
            }}
          />
        </FlexRow>
      </StorySection>

      <StorySection title="Button icon colors">
        <FlexRow gap={8}>
          <ButtonIcon
            name={IconName.Star}
            size={32}
            color={ThemeColor.Red500}
            tooltip="Red"
            onClick={() => {
              // Intentionally empty for demo purposes
            }}
          />
          <ButtonIcon
            name={IconName.Star}
            size={32}
            color={ThemeColor.Green500}
            tooltip="Green"
            onClick={() => {
              // Intentionally empty for demo purposes
            }}
          />
        </FlexRow>
      </StorySection>

      <StorySection title="Button icon with keyboard shortcut">
        <ButtonIcon
          name={IconName.Save}
          size={32}
          tooltip="Save changes"
          shortcutId={KeyboardShortcutId.ToggleSaved}
          onClick={() => {
            // Intentionally empty for demo purposes
          }}
        />
      </StorySection>
    </>
  );
};
