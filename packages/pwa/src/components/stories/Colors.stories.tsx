import type React from 'react';

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
  'background-2',
  'foreground',
  'border',
  'error',
  'success',
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
    <div className="flex flex-col items-center gap-1">
      <div className={cn('border-border size-16 rounded border', className)} />
      <Text className={cn('text-xs', 'text-text-default')}>{name}</Text>
    </div>
  );
};

const TextColorDisplay: React.FC<{
  readonly name: string;
  readonly className?: string;
}> = ({name, className}) => {
  return (
    <div className="flex flex-col items-start gap-1">
      <Text className={cn('text-lg', className)}>Text sample</Text>
      <Text className="text-xs">{name}</Text>
    </div>
  );
};

export const ColorsStories: React.FC = () => {
  return (
    <>
      <StorySection title="Base colors">
        <div className="flex flex-col gap-4">
          {baseColorNames.map((colorName) => (
            <div key={colorName} className="flex flex-row flex-wrap items-end gap-2">
              {shades.map((shade) => {
                const name = `${colorName}-${shade}`;
                const bgClass = `bg-${name}`;
                return <ColorSwatch key={name} name={name} className={bgClass} />;
              })}
            </div>
          ))}
          {/* Add black and paper */}
          <div className="flex flex-row flex-wrap items-end gap-2">
            <ColorSwatch key="black" name="black" className="bg-black" />
            <ColorSwatch key="paper" name="paper" className="bg-paper" />
          </div>
        </div>
      </StorySection>

      <StorySection title="Semantic colors">
        <Text className="mb-2">General</Text>
        <div className="mb-4 flex flex-row flex-wrap items-end gap-2">
          {semanticColorNames.map((name) => {
            const bgClass = `bg-${name}`;
            return <ColorSwatch key={name} name={name} className={bgClass} />;
          })}
        </div>

        <Text className="mb-2">Text</Text>
        <div className="mb-4 grid grid-cols-2 items-start gap-4">
          {textColorNames.map((name) => {
            const textClass = name; // Class name is the variable name itself
            return <TextColorDisplay key={name} name={name} className={textClass} />;
          })}
        </div>

        <Text className="mb-2">Neutral Scale</Text>
        <div className="mb-4 flex flex-row flex-wrap items-end gap-2">
          {neutralColorNames.map((name) => {
            const bgClass = `bg-${name}`;
            return <ColorSwatch key={name} name={name} className={bgClass} />;
          })}
        </div>

        <Text className="mb-2">Level 1 Colors</Text>
        <div className="mb-4 flex flex-row flex-wrap items-end gap-2">
          {level1ColorNames.map((name) => {
            const bgClass = `bg-${name}`;
            return <ColorSwatch key={name} name={name} className={bgClass} />;
          })}
        </div>

        <Text className="mb-2">Level 2 Colors</Text>
        <div className="flex flex-row flex-wrap items-end gap-2">
          {level2ColorNames.map((name) => {
            const bgClass = `bg-${name}`;
            return <ColorSwatch key={name} name={name} className={bgClass} />;
          })}
        </div>
      </StorySection>
    </>
  );
};
