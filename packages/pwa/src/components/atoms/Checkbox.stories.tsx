import {useState} from 'react';

import {Checkbox} from '@src/components/atoms/Checkbox';
import {FlexColumn} from '@src/components/atoms/Flex';
import {Label} from '@src/components/atoms/Label';
import {Text} from '@src/components/atoms/Text';
import {StorySection} from '@src/components/stories/StorySection';

export const CheckboxStories: React.FC = () => {
  const [checked, setChecked] = useState<boolean>(false);

  return (
    <>
      <StorySection title="Basic checkbox">
        <Checkbox />
      </StorySection>

      <StorySection title="Disabled checkbox">
        <Checkbox disabled />
      </StorySection>

      <StorySection title="Controlled checkbox">
        <FlexColumn gap={2}>
          <Checkbox checked={checked} onCheckedChange={(value) => setChecked(value === true)} />
          <Text>Checked: {checked ? 'Yes' : 'No'}</Text>
        </FlexColumn>
      </StorySection>

      <StorySection title="Checkbox with label">
        <FlexColumn gap={2}>
          <div className="flex items-center gap-2">
            <Checkbox id="terms" />
            <Label htmlFor="terms">Accept terms and conditions</Label>
          </div>
        </FlexColumn>
      </StorySection>
    </>
  );
};
