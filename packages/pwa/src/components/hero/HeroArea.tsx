import type React from 'react';

import type {HeroAction} from '@sharedClient/types/heroActions.client.types';

import {FlexColumn} from '@src/components/atoms/Flex';
import {Text} from '@src/components/atoms/Text';
import {HeroActionButtons} from '@src/components/hero/HeroActionButton';

export const HeroArea: React.FC<{
  readonly title: string | React.ReactElement;
  readonly subtitle: string | React.ReactElement;
  readonly actions: readonly HeroAction[];
  readonly bottomContent?: React.ReactElement;
}> = (props) => {
  const {title, subtitle, actions, bottomContent} = props;

  return (
    <FlexColumn align="center" justify="center" className="h-full w-full">
      <FlexColumn align="center" gap={6}>
        <FlexColumn align="center" gap={2} className="max-w-md">
          <Text as="h2" bold align="center">
            {title}
          </Text>
          <Text as="p" light align="center">
            {subtitle}
          </Text>
        </FlexColumn>
        <HeroActionButtons actions={actions} />
        {bottomContent}
      </FlexColumn>
    </FlexColumn>
  );
};
