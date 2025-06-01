import type React from 'react';
import {useCallback, useState} from 'react';
import {toast} from 'sonner';

import {logger} from '@shared/services/logger.shared';

import {assertNever} from '@shared/lib/utils.shared';

import type {
  AccountExperiment,
  BooleanAccountExperiment,
  StringAccountExperiment,
} from '@shared/types/experiments.types';
import {ExperimentType} from '@shared/types/experiments.types';

import {useExperimentsStore} from '@sharedClient/stores/ExperimentsStore';

import {Checkbox} from '@src/components/atoms/Checkbox';
import {FlexColumn, FlexRow} from '@src/components/atoms/Flex';
import {Input} from '@src/components/atoms/Input';
import {Text} from '@src/components/atoms/Text';

const ExperimentControl: React.FC<{
  readonly accountExperiment: AccountExperiment;
}> = ({accountExperiment}) => {
  switch (accountExperiment.experimentType) {
    case ExperimentType.Boolean:
      return <BooleanExperimentControl accountExperiment={accountExperiment} />;
    case ExperimentType.String:
      return <StringExperimentControl accountExperiment={accountExperiment} />;
    default:
      assertNever(accountExperiment);
  }
};

const BooleanExperimentControl: React.FC<{
  readonly accountExperiment: BooleanAccountExperiment;
}> = ({accountExperiment}) => {
  const experimentsService = useExperimentsStore((state) => state.experimentsService);

  const handleBooleanValueChanged = useCallback(
    async (isChecked: boolean) => {
      if (!experimentsService) return;

      const updateResult = await experimentsService.setIsExperimentEnabled({
        experimentId: accountExperiment.definition.experimentId,
        isEnabled: isChecked,
      });

      // TODO: Unify some of this logic across different experiment types.
      const enableOrDisable = isChecked ? 'enable' : 'disable';
      if (!updateResult.success) {
        logger.error(updateResult.error, {accountExperiment, isChecked});
        toast.error(`Failed to ${enableOrDisable} experiment`);
        return;
      }

      toast(`Experiment ${enableOrDisable}d`);
    },
    [accountExperiment, experimentsService]
  );

  return (
    <Checkbox checked={accountExperiment.isEnabled} onCheckedChange={handleBooleanValueChanged} />
  );
};

const StringExperimentControl: React.FC<{
  readonly accountExperiment: StringAccountExperiment;
}> = ({accountExperiment}) => {
  const experimentsService = useExperimentsStore((state) => state.experimentsService);
  const [inputValue, setInputValue] = useState(accountExperiment.value);

  const handleStringExperimentEnabled = useCallback(
    async (isChecked: boolean) => {
      if (!experimentsService) return;

      const updateResult = await experimentsService.setIsExperimentEnabled({
        experimentId: accountExperiment.definition.experimentId,
        isEnabled: isChecked,
      });

      // TODO: Unify some of this logic across different experiment types.
      const enableOrDisable = isChecked ? 'enable' : 'disable';
      if (!updateResult.success) {
        logger.error(updateResult.error, {accountExperiment, isChecked});
        toast.error(`Failed to ${enableOrDisable} experiment`);
        return;
      }

      toast(`Experiment ${enableOrDisable}d`);
    },
    [accountExperiment, experimentsService]
  );

  const handleStringExperimentValueChanged = useCallback(
    async (value: string) => {
      if (!experimentsService) return;

      const updateResult = await experimentsService.setStringExperimentValue({
        accountExperiment,
        value,
      });

      if (!updateResult.success) {
        logger.error(updateResult.error, {accountExperiment, value});
        toast.error('Failed to update string experiment value');
        return;
      }

      toast('Experiment value updated');
    },
    [accountExperiment, experimentsService]
  );

  return (
    <FlexRow gap={2}>
      <Input
        value={inputValue}
        onChange={(event) => setInputValue(event.target.value)}
        onBlur={async () => await handleStringExperimentValueChanged(inputValue)}
        className="max-w-xs"
        disabled={!accountExperiment.isEnabled}
      />
      <Checkbox
        checked={accountExperiment.isEnabled}
        onCheckedChange={handleStringExperimentEnabled}
      />
    </FlexRow>
  );
};

export const ExperimentRow: React.FC<{
  readonly accountExperiment: AccountExperiment;
}> = ({accountExperiment}) => {
  return (
    <FlexRow gap={4} padding={4} className="rounded-lg border border-gray-200">
      <FlexColumn flex={1} gap={2}>
        <Text bold>{accountExperiment.definition.title}</Text>
        <Text as="p" light>
          {accountExperiment.definition.description}
        </Text>
        <Text as="p" light>
          ID: {accountExperiment.definition.experimentId} | Type:{' '}
          {accountExperiment.definition.experimentType} | Default:{' '}
          {String(accountExperiment.definition.defaultIsEnabled)}
        </Text>
      </FlexColumn>
      <FlexColumn gap={2} className="items-end">
        <ExperimentControl accountExperiment={accountExperiment} />
      </FlexColumn>
    </FlexRow>
  );
};
