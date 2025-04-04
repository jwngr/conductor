import {assertNever} from '@shared/lib/utils.shared';

import type {ButtonIconSize, IconSize} from '@shared/types/icons.types';

export function getIconSizeFromButtonIconSize(buttonIconSize: ButtonIconSize): IconSize {
  switch (buttonIconSize) {
    case 24:
      return 16;
    case 32:
      return 24;
    case 40:
      return 32;
    default:
      assertNever(buttonIconSize);
  }
}
