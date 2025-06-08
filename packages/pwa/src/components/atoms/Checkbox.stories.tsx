import {useState} from 'react';

import {Checkbox} from '@src/components/atoms/Checkbox';
import {FlexColumn, FlexRow} from '@src/components/atoms/Flex';
import {Label} from '@src/components/atoms/Label';
import {P} from '@src/components/atoms/Text';
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
          <P>Checked: {checked ? 'Yes' : 'No'}</P>
        </FlexColumn>
      </StorySection>

      <StorySection title="Checkbox with label">
        <FlexRow gap={3}>
          <Checkbox id="terms" />
          <Label htmlFor="terms">Accept terms and conditions</Label>
        </FlexRow>
      </StorySection>
    </>
  );
};
