import type {HTMLAttributes} from 'react';

import {assertNever} from '@shared/lib/utils.shared';

import type {FlexValue} from '@shared/types/flex.types';
import {DEFAULT_TEXT_COLOR, DEFAULT_TEXT_LIGHT_COLOR} from '@shared/types/theme.types';

import {cn} from '@src/lib/utils.pwa';

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

/**
 * Note that most colors should be handled by Tailwind classes.
 *
 * TODO: Add back a proper `color` attribute that is semantically cleaner.
 */
function getColorClasses(args: {readonly light?: boolean}): string {
  const {light} = args;
  // TODO: Move this default somewhere else so that every text component doesn't need to set it. It
  // also overrides color of any text component it is inside, which breaks the `span` use case.
  return light ? DEFAULT_TEXT_LIGHT_COLOR : DEFAULT_TEXT_COLOR;
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
  readonly flex?: FlexValue;
  readonly truncate?: boolean;
  readonly monospace?: boolean;
  readonly light?: boolean;
  readonly underline?: 'always' | 'hover' | 'never';
  readonly children: React.ReactNode;
}

const Text: React.FC<TextProps> = ({
  as: Component = 'p',
  align,
  bold,
  weight,
  flex,
  children,
  light,
  monospace,
  truncate,
  underline,
  style,
  className,
  ...rest
}) => {
  const classes = cn(
    getColorClasses({light}),
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

type TextPropsWithoutAs = Omit<TextProps, 'as'>;

export const P: React.FC<TextPropsWithoutAs> = ({...props}) => <Text as="p" {...props} />;
export const Span: React.FC<TextPropsWithoutAs> = ({...props}) => <Text as="span" {...props} />;
export const H1: React.FC<TextPropsWithoutAs> = ({...props}) => <Text as="h1" {...props} />;
export const H2: React.FC<TextPropsWithoutAs> = ({...props}) => <Text as="h2" {...props} />;
export const H3: React.FC<TextPropsWithoutAs> = ({...props}) => <Text as="h3" {...props} />;
export const H4: React.FC<TextPropsWithoutAs> = ({...props}) => <Text as="h4" {...props} />;
export const H5: React.FC<TextPropsWithoutAs> = ({...props}) => <Text as="h5" {...props} />;
export const H6: React.FC<TextPropsWithoutAs> = ({...props}) => <Text as="h6" {...props} />;
