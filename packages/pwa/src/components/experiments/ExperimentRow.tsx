import type React from 'react';
import {useCallback} from 'react';
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
  readonly experiment: AccountExperiment;
}> = ({experiment}) => {
  switch (experiment.experimentType) {
    case ExperimentType.Boolean:
      return <BooleanExperimentControl experiment={experiment} />;
    case ExperimentType.String:
      return <StringExperimentControl experiment={experiment} />;
    default:
      assertNever(experiment);
  }
};

const BooleanExperimentControl: React.FC<{
  readonly experiment: BooleanAccountExperiment;
}> = ({experiment}) => {
  const experimentsService = useExperimentsStore((state) => state.experimentsService);

  const handleBooleanValueChanged = useCallback(
    async (isChecked: boolean) => {
      if (!experimentsService) return;

      const updateResult = await experimentsService.setBooleanExperimentValue({
        experimentId: experiment.definition.experimentId,
        isEnabled: isChecked,
      });

      if (!updateResult.success) {
        logger.error(updateResult.error, {experiment, isChecked});
        toast.error('Failed to update experiment value');
      }
    },
    [experiment, experimentsService]
  );

  return <Checkbox checked={experiment.isEnabled} onCheckedChange={handleBooleanValueChanged} />;
};

const StringExperimentControl: React.FC<{
  readonly experiment: StringAccountExperiment;
}> = ({experiment}) => {
  const experimentsService = useExperimentsStore((state) => state.experimentsService);

  const handleStringValueChanged = useCallback(
    async (value: string) => {
      if (!experimentsService) return;

      const updateResult = await experimentsService.setStringExperimentValue({
        experimentId: experiment.definition.experimentId,
        isEnabled: experiment.isEnabled,
        value,
      });

      if (!updateResult.success) {
        logger.error(updateResult.error, {
          experiment: experiment,
          value,
        });
        toast.error('Failed to update experiment value');
      }
    },
    [experiment, experimentsService]
  );

  return (
    <Input
      value={experiment.value}
      onChange={async (event) => await handleStringValueChanged(event.target.value)}
      className="max-w-xs"
    />
  );
};

export const ExperimentRow: React.FC<{
  readonly experiment: AccountExperiment;
}> = ({experiment}) => {
  return (
    <FlexRow gap={4} padding={4} className="rounded-lg border border-gray-200">
      <FlexColumn flex={1} gap={2}>
        <Text bold>{experiment.definition.title}</Text>
        <Text as="p" light>
          {experiment.definition.description}
        </Text>
        <Text as="p" light>
          ID: {experiment.definition.experimentId} | Type: {experiment.definition.experimentType} |
          Default: {String(experiment.definition.defaultValue)}
        </Text>
      </FlexColumn>
      <FlexColumn gap={2} className="items-end">
        <ExperimentControl experiment={experiment} />
      </FlexColumn>
    </FlexRow>
  );
};
