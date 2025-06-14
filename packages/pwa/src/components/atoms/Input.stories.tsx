import {useState} from 'react';

import {FlexColumn} from '@src/components/atoms/Flex';
import {Input} from '@src/components/atoms/Input';
import {P} from '@src/components/atoms/Text';
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
        <FlexColumn gap={2}>
          <Input
            value={controlledValue}
            onChange={(e) => setControlledValue(e.target.value)}
            placeholder="Type something..."
          />
          <P>Current value: {controlledValue || '(empty)'}</P>
        </FlexColumn>
      </StorySection>
    </>
  );
};
