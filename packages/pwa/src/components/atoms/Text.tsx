import type {HTMLAttributes} from 'react';

import {assertNever} from '@shared/lib/utils.shared';

import type {FlexValue} from '@shared/types/flex.types';
import {DEFAULT_TEXT_LIGHT_COLOR} from '@shared/types/theme.types';

import {cn} from '@src/lib/utils.pwa';

type FontWeight = 'normal' | 'bold' | '900';
function getFontWeightClasses(args: {
  readonly bold?: boolean;
  readonly weight?: FontWeight;
}): string | null {
  const {bold, weight} = args;

  switch (weight) {
    case undefined:
      // `weight` takes precedence over `bold`.
      return bold ? 'font-bold' : null;
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

type TextAlign = 'left' | 'center' | 'right';
function getTextAlignClasses(args: {readonly align?: TextAlign}): string | null {
  const {align} = args;
  switch (align) {
    case undefined:
      return null;
    case 'left':
      return 'text-left';
    case 'center':
      return 'text-center';
    case 'right':
      return 'text-right';
    default:
      return assertNever(align);
  }
}

// TODO: Introduce an additional typesafe `color` attribute.
function getColorClasses(args: {
  readonly light?: boolean;
  readonly error?: boolean;
  readonly success?: boolean;
  readonly isSpan?: boolean;
}): string | null {
  const {light, error, success, isSpan} = args;
  if (error) return 'text-error';
  if (success) return 'text-success';
  if (light) return DEFAULT_TEXT_LIGHT_COLOR;
  if (isSpan) return 'text-inherit';
  return null;
}

type Underline = 'always' | 'hover' | 'never';
function getUnderlineClasses(args: {readonly underline?: Underline}): string | null {
  const {underline} = args;
  switch (underline) {
    case undefined:
      return null;
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

function getFlexClasses(args: {readonly flex?: FlexValue}): string | null {
  const {flex} = args;
  switch (flex) {
    case undefined:
      return null;
    case true:
      return 'flex-1';
    case false:
      return 'flex-none';
    case 'auto':
      return 'flex-auto';
    case 'initial':
      return 'flex-initial';
    default:
      return assertNever(flex);
  }
}

type TextElement = 'p' | 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

interface TextProps extends HTMLAttributes<HTMLParagraphElement> {
  readonly as: TextElement;
  readonly align?: TextAlign;
  readonly bold?: boolean;
  readonly weight?: FontWeight;
  readonly flex?: FlexValue;
  readonly truncate?: boolean;
  readonly nowrap?: boolean;
  readonly monospace?: boolean;
  readonly light?: boolean;
  readonly error?: boolean;
  readonly success?: boolean;
  readonly underline?: 'always' | 'hover' | 'never';
  readonly italic?: boolean;
  readonly children: React.ReactNode;
}

const Text: React.FC<TextProps> = ({
  as: Component,
  align,
  bold,
  weight,
  flex,
  children,
  light,
  error,
  success,
  monospace,
  truncate,
  nowrap,
  underline,
  italic,
  style,
  className,
  ...rest
}) => {
  const classes = cn(
    getColorClasses({light, error, success, isSpan: Component === 'span'}),
    getUnderlineClasses({underline}),
    getFontWeightClasses({bold, weight}),
    getTextAlignClasses({align}),
    getFlexClasses({flex}),
    monospace && 'font-mono',
    truncate && 'truncate',
    nowrap && 'whitespace-nowrap',
    italic && 'italic',
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
