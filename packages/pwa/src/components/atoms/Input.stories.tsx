import {useState} from 'react';

import {Input} from '@src/components/atoms/Input';
import {Text} from '@src/components/atoms/Text';
import {StorySection} from '@src/components/stories/StorySection';

export const InputStories: React.FC = () => {
  const [controlledValue, setControlledValue] = useState('');

  return (
    <>
      <StorySection title="Basic input">
        <Input placeholder="Enter text here..." />
      </StorySection>

      <StorySection title="Disabled input">
        <Input disabled placeholder="This input is disabled" />
      </StorySection>

      <StorySection title="Controlled input">
        <div className="flex flex-col gap-2">
          <Input
            value={controlledValue}
            onChange={(e) => setControlledValue(e.target.value)}
            placeholder="Type something..."
          />
          <Text>Current value: {controlledValue || '(empty)'}</Text>
        </div>
      </StorySection>
    </>
  );
};
