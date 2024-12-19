import {useState} from 'react';

import {FlexColumn} from '@src/components/atoms/Flex';
import {Input} from '@src/components/atoms/Input';
import {Text} from '@src/components/atoms/Text';
import {StorySection} from '@src/components/styleguide/StorySection';

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
        <FlexColumn gap={8}>
          <Input
            value={controlledValue}
            onChange={(e) => setControlledValue(e.target.value)}
            placeholder="Type something..."
          />
          <Text>Current value: {controlledValue || '(empty)'}</Text>
        </FlexColumn>
      </StorySection>

      <StorySection title="Input with label">
        <FlexColumn gap={4}>
          <Text as="label" htmlFor="email">
            Email address
          </Text>
          <Input id="email" type="email" placeholder="Enter your email" />
        </FlexColumn>
      </StorySection>
    </>
  );
};
