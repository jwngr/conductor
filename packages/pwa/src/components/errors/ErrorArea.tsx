import type React from 'react';

import type {ErrorScreenAction} from '@sharedClient/types/errors.client.types';

import {FlexColumn} from '@src/components/atoms/Flex';
import {Text} from '@src/components/atoms/Text';
import {ErrorActionButtons, TechnicalDetailsSection} from '@src/components/errors/ErrorComponents';

export const ErrorArea: React.FC<{
  readonly error: Error;
  readonly title: string | React.ReactElement;
  readonly subtitle: string | React.ReactElement;
  readonly actions: readonly ErrorScreenAction[];
}> = (props) => {
  const {error, title, subtitle, actions} = props;

  return (
    <FlexColumn align="center" justify="center">
      <FlexColumn align="center" gap={4}>
        <Text as="h2" bold>
          {title}
        </Text>
        <Text as="p" light>
          {subtitle}
        </Text>
        <ErrorActionButtons actions={actions} />
        <TechnicalDetailsSection error={error} />
      </FlexColumn>
    </FlexColumn>
  );
};
