import type React from 'react';
import {useCallback} from 'react';

import {getIconSizeFromButtonIconSize} from '@shared/lib/icons.shared';

import type {ButtonIconSize, IconName} from '@shared/types/icons.types';
import type {KeyboardShortcutId} from '@shared/types/shortcuts.types';
import type {StyleAttributes} from '@shared/types/utils.types';

import type {MouseEvent} from '@sharedClient/types/utils.client.types';

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
}

export const ButtonIcon: React.FC<ButtonIconProps> = ({
  name,
  tooltip,
  size: buttonIconSize,
  onClick,
  shortcutId,
  className,
  ...styleProps
}) => {
  const iconSize = getIconSizeFromButtonIconSize(buttonIconSize);

  const handleShortcut = useCallback(() => {
    // TODO: Clean up this type.
    onClick?.(null as unknown as MouseEvent<HTMLDivElement>);
  }, [onClick]);

  const buttonIcon = (
    <div
      className={cn(
        'text-red-1',
        'flex cursor-pointer items-center justify-center rounded',
        'bg-neutral-200 hover:bg-neutral-300',
        {
          'h-6 w-6': buttonIconSize === 24,
          'h-8 w-8': buttonIconSize === 32,
          'h-10 w-10': buttonIconSize === 40,
        },
        className
      )}
      onClick={onClick}
    >
      <Icon className={className} name={name} size={iconSize} {...styleProps} />
    </div>
  );

  return (
    <Tooltip
      trigger={buttonIcon}
      content={tooltip}
      shortcutId={shortcutId}
      onShortcutTrigger={handleShortcut}
    />
  );
};
