import type React from 'react';

import type {HeroAction} from '@sharedClient/types/heroActions.client.types';

import {FlexColumn} from '@src/components/atoms/Flex';
import {H2, P} from '@src/components/atoms/Text';
import {HeroActionButtons} from '@src/components/hero/HeroActionButton';

export const HeroArea: React.FC<{
  readonly title: string | React.ReactElement;
  readonly subtitle: string | React.ReactElement;
  readonly actions: readonly HeroAction[];
  readonly bottomContent?: React.ReactElement;
}> = ({title, subtitle, actions, bottomContent}) => {
  const titleContent = (
    <H2 bold align="center">
      {title}
    </H2>
  );

  const subtitleContent = (
    <P light align="center">
      {subtitle}
    </P>
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
