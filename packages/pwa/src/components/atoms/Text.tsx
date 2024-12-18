import {HTMLAttributes} from 'react';
import styled, {css} from 'styled-components';

import {assertNever} from '@shared/lib/utils';

import {ThemeColor} from '@shared/types/theme.types';

type FontWeight = 'normal' | 'bold' | '900';
const DEFAULT_FONT_WEIGHT = 'normal';
function getFontWeight(bold?: boolean, weight?: FontWeight) {
  if (typeof weight === 'undefined') {
    return bold ? 'bold' : DEFAULT_FONT_WEIGHT;
  } else {
    return weight;
  }
}

type TextElement = 'p' | 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

interface TextWrapperProps {
  readonly $color?: ThemeColor;
  readonly $hoverColor?: ThemeColor;
  readonly $light?: boolean;
  readonly $monospace?: boolean;
  readonly $truncate?: boolean;
  readonly $underline?: 'always' | 'hover' | 'never';
}

export const TextWrapper = styled.span<TextWrapperProps>`
  ${(props) =>
    props.$monospace
      ? css`
          font-family: ui-monospace, Menlo, Monaco, Consolas, 'Courier New', monospace;
        `
      : null}

  ${(props) =>
    props.$truncate
      ? css`
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 100%;
        `
      : null}

  

  ${({theme, $color, $light}) => {
    // TODO: Set the default color somewhere. Probably shouldn't do it here.
    if (!$color && !$light) return null;
    return css`
      color: ${theme.colors[$color ?? ThemeColor.Neutral500]};
    `;
  }};

  ${({theme, $hoverColor}) => {
    if (!$hoverColor) return null;
    return css`
      &:hover {
        color: ${theme.colors[$hoverColor]};
      }
    `;
  }}

  ${({$underline}) => {
    if (!$underline) return null;
    switch ($underline) {
      case 'always':
        return css`
          cursor: pointer;
          text-decoration: underline;
        `;
      case 'hover':
        return css`
          &:hover {
            cursor: pointer;
            text-decoration: underline;
          }
        `;
      case 'never':
        return css`
          text-decoration: none;
        `;
      default:
        assertNever($underline);
    }
  }}
`;

interface TextProps extends HTMLAttributes<HTMLParagraphElement> {
  readonly as?: TextElement;
  readonly align?: 'left' | 'center' | 'right';
  readonly bold?: boolean;
  readonly weight?: FontWeight;
  readonly color?: ThemeColor;
  readonly hoverColor?: ThemeColor;
  readonly flex?: number | string | boolean;
  readonly truncate?: boolean;
  readonly monospace?: boolean;
  readonly light?: boolean;
  readonly underline?: 'always' | 'hover' | 'never';
  readonly children: React.ReactNode;
}

export const Text: React.FC<TextProps> = ({
  as = 'p',
  align,
  bold,
  weight,
  flex,
  children,
  style,
  color,
  hoverColor,
  light,
  monospace,
  truncate,
  underline,
  ...rest
}) => {
  return (
    <TextWrapper
      as={as}
      style={{
        ...style,
        textAlign: align,
        fontWeight: getFontWeight(bold, weight),
        flex: flex === true ? 1 : flex === false ? 0 : flex,
      }}
      $color={color}
      $hoverColor={hoverColor}
      $light={light}
      $monospace={monospace}
      $truncate={truncate}
      $underline={underline}
      {...rest}
    >
      {children}
    </TextWrapper>
  );
};
