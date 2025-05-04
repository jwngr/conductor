import type React from 'react';

import {FlexColumn, FlexRow} from '@src/components/atoms/Flex';
import {Text} from '@src/components/atoms/Text';
import {StorySection} from '@src/components/stories/StorySection';

import {cn} from '@src/lib/utils.pwa';

const baseColorNames = [
  'base',
  'red',
  'orange',
  'yellow',
  'green',
  'cyan',
  'blue',
  'purple',
  'magenta',
];
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
];

const semanticColorNames = [
  'background',
  'foreground',
  'error',
  'error-foreground',
  'success',
  'success-foreground',
  'primary',
  'primary-foreground',
  'border',
];

const textColorNames = ['text-default', 'text-light', 'text-link'];

const neutralColorNames = ['neutral-1', 'neutral-2', 'neutral-3', 'neutral-4', 'neutral-5'];

const level1ColorNames = [
  'red-1',
  'orange-1',
  'yellow-1',
  'green-1',
  'cyan-1',
  'blue-1',
  'purple-1',
  'magenta-1',
];

const level2ColorNames = [
  'red-2',
  'orange-2',
  'yellow-2',
  'green-2',
  'cyan-2',
  'blue-2',
  'purple-2',
  'magenta-2',
];

const ColorSwatch: React.FC<{
  readonly name: string;
  readonly className?: string;
}> = ({name, className}) => {
  return (
    <FlexColumn gap={1} align="center">
      <div className={cn('border-border size-16 rounded border', className)} />
      <Text className={cn('text-xs', 'text-text-default')}>{name}</Text>
    </FlexColumn>
  );
};

const TextColorDisplay: React.FC<{
  readonly name: string;
  readonly className?: string;
}> = ({name, className}) => {
  return (
    <FlexColumn gap={1} align="start">
      <Text className={cn('text-lg', className)}>Text sample</Text>
      <Text className="text-xs">{name}</Text>
    </FlexColumn>
  );
};

export const ColorsStories: React.FC = () => {
  return (
    <>
      <StorySection title="Base colors">
        <FlexColumn gap={4}>
          {baseColorNames.map((colorName) => (
            <FlexRow key={colorName} gap={2} align="end" wrap>
              {shades.map((shade) => {
                const name = `${colorName}-${shade}`;
                const bgClass = `bg-${name}`;
                return <ColorSwatch key={name} name={name} className={bgClass} />;
              })}
            </FlexRow>
          ))}
          {/* Add black and paper */}
          <FlexRow gap={2} align="end" wrap>
            <ColorSwatch key="black" name="black" className="bg-black" />
            <ColorSwatch key="paper" name="paper" className="bg-paper" />
          </FlexRow>
        </FlexColumn>
      </StorySection>

      <StorySection title="Semantic colors">
        <Text className="mb-2">General</Text>
        <FlexRow gap={2} align="end" wrap>
          {semanticColorNames.map((name) => {
            const bgClass = `bg-${name}`;
            return <ColorSwatch key={name} name={name} className={bgClass} />;
          })}
        </FlexRow>

        <Text className="mb-2">Text</Text>
        <FlexRow gap={2} align="end" wrap>
          {textColorNames.map((name) => {
            const textClass = name; // Class name is the variable name itself
            return <TextColorDisplay key={name} name={name} className={textClass} />;
          })}
        </FlexRow>

        <Text className="mb-2">Neutral scale</Text>
        <FlexRow gap={2} align="end" wrap>
          {neutralColorNames.map((name) => {
            const bgClass = `bg-${name}`;
            return <ColorSwatch key={name} name={name} className={bgClass} />;
          })}
        </FlexRow>

        <Text className="mb-2">Level 1 colors</Text>
        <FlexRow gap={2} align="end" wrap>
          {level1ColorNames.map((name) => {
            const bgClass = `bg-${name}`;
            return <ColorSwatch key={name} name={name} className={bgClass} />;
          })}
        </FlexRow>

        <Text className="mb-2">Level 2 colors</Text>
        <FlexRow gap={2} align="end" wrap>
          {level2ColorNames.map((name) => {
            const bgClass = `bg-${name}`;
            return <ColorSwatch key={name} name={name} className={bgClass} />;
          })}
        </FlexRow>
      </StorySection>
    </>
  );
};
