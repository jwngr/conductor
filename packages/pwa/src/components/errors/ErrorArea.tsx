import type React from 'react';

import type {HeroAction} from '@sharedClient/types/heroActions.client.types';

import {ErrorDetailsToggle} from '@src/components/errors/ErrorDetailsToggle';
import {HeroArea} from '@src/components/hero/HeroArea';

export const ErrorArea: React.FC<{
  readonly error: Error;
  readonly title: string | React.ReactElement;
  readonly subtitle: string | React.ReactElement;
  readonly actions: readonly HeroAction[];
}> = ({error, title, subtitle, actions}) => {
  return (
    <HeroArea
      title={title}
      subtitle={subtitle}
      actions={actions}
      bottomContent={<ErrorDetailsToggle error={error} />}
    />
  );
};
