import type React from 'react';
import {useCallback} from 'react';

import {getIconSizeFromButtonIconSize} from '@shared/lib/icons.shared';

import type {ButtonIconSize, IconName} from '@shared/types/icons.types';
import type {KeyboardShortcutId} from '@shared/types/shortcuts.types';
import type {StyleAttributes} from '@shared/types/utils.types';

import type {MouseEvent} from '@sharedClient/types/utils.client.types';

import * as styles from '@src/components/atoms/ButtonIcon.css';
import {Icon} from '@src/components/atoms/Icon';
import type {TooltipContent} from '@src/components/atoms/Tooltip';
import {Tooltip} from '@src/components/atoms/Tooltip';

import {cn} from '@src/lib/utils.pwa';

import type {OnClick} from '@src/types/utils.pwa.types';

interface ButtonIconProps extends StyleAttributes {
  readonly name: IconName;
  readonly size: ButtonIconSize;
  readonly onClick: OnClick<HTMLDivElement>;
  readonly shortcutId?: KeyboardShortcutId;
  readonly tooltip: TooltipContent;
  readonly className?: string;
  readonly disabled?: boolean;
}

export const ButtonIcon: React.FC<ButtonIconProps> = ({
  name,
  tooltip,
  size: buttonIconSize,
  onClick,
  shortcutId,
  className,
  disabled,
  ...styleProps
}) => {
  const iconSize = getIconSizeFromButtonIconSize(buttonIconSize);

  const handleShortcut = useCallback(async () => {
    // TODO: Clean up this type.
    onClick?.(null as unknown as MouseEvent<HTMLDivElement>);
  }, [onClick]);

  // Combine the base style, size variant, and any additional className
  const combinedClassName = cn(
    styles.buttonIconWrapper,
    styles.buttonIconSize[buttonIconSize],
    className
  );

  const buttonIcon = (
    <div
      className={combinedClassName}
      // Disable pointer events and hover effect if disabled
      style={disabled ? {pointerEvents: 'none', cursor: 'default'} : undefined}
      onClick={!disabled ? onClick : undefined}
    >
      <Icon name={name} size={iconSize} {...styleProps} />
    </div>
  );

  if (disabled) {
    return buttonIcon;
  }

  return (
    <Tooltip
      trigger={buttonIcon}
      content={tooltip}
      shortcutId={shortcutId}
      onShortcutTrigger={handleShortcut}
    />
  );
};
