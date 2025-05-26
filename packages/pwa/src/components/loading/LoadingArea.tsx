import type React from 'react';

import {useDelayedVisibility} from '@sharedClient/hooks/utils.hook';

import {FlexColumn} from '@src/components/atoms/Flex';
import {Text} from '@src/components/atoms/Text';

export const LoadingArea: React.FC<{
  readonly text: string | React.ReactElement;
}> = ({text}) => {
  const isVisible = useDelayedVisibility(150);

  if (!isVisible) {
    return null;
  }

  return (
    <FlexColumn
      align="center"
      justify="center"
      className="animate-in fade-in h-full w-full duration-300"
    >
      <FlexColumn align="center" gap={6} className="w-full max-w-[720px]">
        <Text as="h2" bold align="center">
          {text}
        </Text>
      </FlexColumn>
    </FlexColumn>
  );
};
