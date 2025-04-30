import type React from 'react';

import {Text} from '@src/components/atoms/Text';
import {StorySection} from '@src/components/styleguide/StorySection';

import {vars} from '@src/lib/theme.css';

// Define base color names and shades (keys for vars object)
const baseColorNames = [
  'base',
  'redBase',
  'orangeBase',
  'yellowBase',
  'greenBase',
  'cyanBase',
  'blueBase',
  'purpleBase',
  'magentaBase',
] as const;
type BaseColorName = (typeof baseColorNames)[number];

const shades = [
  '50',
  '100',
  '150',
  '200',
  '300',
  '400',
  '500',
  '600',
  '700',
  '800',
  '850',
  '900',
  '950',
] as const;
type Shade = (typeof shades)[number];

// Define semantic color names (top-level keys in vars.colors)
const semanticColorNames = [
  'background',
  'background2',
  'foreground',
  'border',
  'error',
  'success',
] as const;
type SemanticColorName = (typeof semanticColorNames)[number];

const textColorNames = ['text', 'textLight', 'textLink'] as const;
type TextColorName = (typeof textColorNames)[number];

// Define semantic color groups (keys with nested levels '1' or '2')
const semanticGroupNames = [
  'red',
  'orange',
  'yellow',
  'green',
  'cyan',
  'blue',
  'purple',
  'magenta',
] as const;
type SemanticGroupName = (typeof semanticGroupNames)[number];

const semanticGroupLevels = ['1', '2'] as const;
type SemanticGroupLevel = (typeof semanticGroupLevels)[number];

// Define neutral color group (key with nested levels '1' through '5')
const neutralLevels = ['1', '2', '3', '4', '5'] as const;
type NeutralLevel = (typeof neutralLevels)[number];

interface ColorSwatchProps {
  label: string;
  colorValue: string;
}

const ColorSwatch: React.FC<ColorSwatchProps> = ({label, colorValue}) => {
  return (
    <div
      style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: vars.spacing[1]}}
    >
      <div
        style={{
          width: '48px',
          height: '48px',
          backgroundColor: colorValue,
          border: `1px solid ${vars.colors.border}`,
          borderRadius: vars.radii.md,
        }}
      />
      <Text style={{fontSize: '12px', color: vars.colors.text}}>{label}</Text>
    </div>
  );
};

interface TextColorDisplayProps {
  name: string;
  colorValue: string;
}

const TextColorDisplay: React.FC<TextColorDisplayProps> = ({name, colorValue}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: vars.spacing[1],
      }}
    >
      <Text style={{fontSize: '16px', color: colorValue}}>Text sample</Text>
      <Text style={{fontSize: '12px'}}>{name}</Text>
    </div>
  );
};

export const ColorsVanillaStories: React.FC = () => {
  return (
    <>
      <StorySection title="Base colors (Vanilla Extract)">
        <div style={{display: 'flex', flexDirection: 'column', gap: vars.spacing[4]}}>
          {baseColorNames.map((colorName) => (
            <div
              key={colorName}
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: vars.spacing[3],
              }}
            >
              <Text style={{width: '100px', textAlign: 'right', flexShrink: 0}}>{colorName}:</Text>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  gap: vars.spacing[2],
                }}
              >
                {shades.map((shade) => {
                  const colorValue = vars.colors[colorName as BaseColorName][shade as Shade];
                  return (
                    <ColorSwatch
                      key={`${colorName}-${shade}`}
                      label={shade}
                      colorValue={colorValue}
                    />
                  );
                })}
              </div>
            </div>
          ))}
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: vars.spacing[3],
            }}
          >
            <Text style={{width: '100px', textAlign: 'right', flexShrink: 0}}>Special:</Text>
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: vars.spacing[2],
              }}
            >
              <ColorSwatch key="black" label="black" colorValue={vars.colors.black} />
              <ColorSwatch key="paper" label="paper" colorValue={vars.colors.paper} />
            </div>
          </div>
        </div>
      </StorySection>

      <StorySection title="Semantic colors (Vanilla Extract)">
        <Text bold className="mb-2">
          General
        </Text>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: vars.spacing[2],
            marginBottom: vars.spacing[4],
            alignItems: 'flex-end',
          }}
        >
          {semanticColorNames.map((name) => {
            const colorValue = vars.colors[name as SemanticColorName];
            return <ColorSwatch key={name} label={name} colorValue={colorValue} />;
          })}
        </div>

        <Text bold className="mb-2">
          Text
        </Text>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: vars.spacing[4],
            marginBottom: vars.spacing[4],
            alignItems: 'flex-start',
          }}
        >
          {textColorNames.map((name) => {
            const colorValue = vars.colors[name as TextColorName];
            return <TextColorDisplay key={name} name={name} colorValue={colorValue} />;
          })}
        </div>

        <Text bold className="mb-2">
          Neutral Scale
        </Text>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: vars.spacing[2],
            marginBottom: vars.spacing[4],
            alignItems: 'flex-end',
          }}
        >
          {neutralLevels.map((level) => {
            const name = `neutral-${level}`;
            const colorValue = vars.colors.neutral[level as NeutralLevel];
            return <ColorSwatch key={name} label={name} colorValue={colorValue} />;
          })}
        </div>

        <Text bold className="mb-2">
          Level 1 & 2 Colors
        </Text>
        <div style={{display: 'flex', flexDirection: 'column', gap: vars.spacing[4]}}>
          {semanticGroupNames.map((groupName) => (
            <div
              key={groupName}
              style={{
                display: 'flex',
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: vars.spacing[2],
                alignItems: 'flex-end',
              }}
            >
              {semanticGroupLevels.map((level) => {
                const name = `${groupName}-${level}`;
                const colorValue =
                  vars.colors[groupName as SemanticGroupName][level as SemanticGroupLevel];
                return <ColorSwatch key={name} label={name} colorValue={colorValue} />;
              })}
            </div>
          ))}
        </div>
      </StorySection>
    </>
  );
};
