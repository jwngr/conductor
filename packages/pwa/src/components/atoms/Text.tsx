import type {HTMLAttributes} from 'react';
import {twMerge} from 'tailwind-merge';

import {assertNever} from '@shared/lib/utils.shared';

import type {ThemeColor} from '@shared/types/theme.types';

import {getThemeColorClass} from '@src/lib/theme.pwa';

const DEFAULT_TEXT_COLOR = 'text-text';
const LIGHT_TEXT_COLOR = 'text-text-light';

type FontWeight = 'normal' | 'bold' | '900';
function getFontWeightClasses(args: {
  readonly bold?: boolean;
  readonly weight?: FontWeight;
}): string {
  const {bold, weight} = args;

  if (typeof weight === 'undefined') {
    return bold ? 'font-bold' : 'normal';
  }

  switch (weight) {
    case 'normal':
      return 'font-normal';
    case 'bold':
      return 'font-bold';
    case '900':
      return 'font-black';
    default:
      return assertNever(weight);
  }
}

function getTextAlignClasses(args: {readonly align?: 'left' | 'center' | 'right'}): string {
  const {align} = args;

  if (typeof align === 'undefined') return '';
  return `text-${align}`;
}

function getColorClasses(args: {
  readonly light?: boolean;
  readonly color?: ThemeColor;
  readonly hoverColor?: ThemeColor;
}): string {
  const {light, color, hoverColor} = args;

  return twMerge(
    // Later rules override previous ones, so `color` takes precedence over `light`.
    light ? LIGHT_TEXT_COLOR : '',
    color ? getThemeColorClass(color) : '',
    hoverColor ? `hover:${getThemeColorClass(hoverColor)}` : ''
  );
}

function getUnderlineClasses(args: {readonly underline?: 'always' | 'hover' | 'never'}): string {
  const {underline} = args;

  if (typeof underline === 'undefined') return '';

  switch (underline) {
    case 'always':
      return 'underline cursor-pointer';
    case 'hover':
      return 'hover:underline cursor-pointer';
    case 'never':
      return 'no-underline';
    default:
      return assertNever(underline);
  }
}

export type FlexValue = 1 | 'auto' | 'initial' | 'none' | boolean;

function getFlexClasses(args: {readonly flex?: FlexValue}): string {
  const {flex} = args;

  if (typeof flex === 'undefined') return '';
  if (typeof flex === 'boolean') {
    return flex ? 'flex-1' : 'flex-none';
  }
  return `flex-${flex}`;
}

function getFontFamilyClasses(args: {readonly monospace?: boolean}): string {
  const {monospace} = args;
  return monospace ? 'font-mono' : 'font-sans';
}

function getTruncateClasses(args: {readonly truncate?: boolean}): string {
  const {truncate} = args;

  if (typeof truncate === 'undefined') return '';
  return truncate ? 'truncate' : '';
}

type TextElement = 'p' | 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

interface TextProps extends HTMLAttributes<HTMLParagraphElement> {
  readonly as?: TextElement;
  readonly align?: 'left' | 'center' | 'right';
  readonly bold?: boolean;
  readonly weight?: FontWeight;
  readonly color?: ThemeColor;
  readonly hoverColor?: ThemeColor;
  readonly flex?: FlexValue;
  readonly truncate?: boolean;
  readonly monospace?: boolean;
  readonly light?: boolean;
  readonly underline?: 'always' | 'hover' | 'never';
  readonly children: React.ReactNode;
}

export const Text: React.FC<TextProps> = ({
  as: Component = 'p',
  align,
  bold,
  weight,
  flex,
  children,
  color,
  hoverColor,
  light,
  monospace,
  truncate,
  underline,
  style,
  className,
  ...rest
}) => {
  const classes = twMerge(
    getColorClasses({light, color, hoverColor}),
    getUnderlineClasses({underline}),
    getFontWeightClasses({bold, weight}),
    getFontFamilyClasses({monospace}),
    getTextAlignClasses({align}),
    getFlexClasses({flex}),
    getTruncateClasses({truncate}),
    className
  );

  return (
    <Component className={classes} style={style} {...rest}>
      {children}
    </Component>
  );
};
