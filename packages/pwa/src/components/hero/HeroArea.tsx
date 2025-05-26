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
}> = ({title, subtitle, actions, bottomContent}) => {
  const titleContent = (
    <Text as="h2" bold align="center">
      {title}
    </Text>
  );

  const subtitleContent = (
    <Text as="p" light align="center">
      {subtitle}
    </Text>
  );

  return (
    <FlexColumn align="center" justify="center" className="h-full w-full">
      <FlexColumn align="center" gap={6} className="w-full max-w-[720px]">
        <FlexColumn align="center" gap={2}>
          {titleContent}
          {subtitleContent}
        </FlexColumn>
        <HeroActionButtons actions={actions} />
        {bottomContent}
      </FlexColumn>
    </FlexColumn>
  );
};
