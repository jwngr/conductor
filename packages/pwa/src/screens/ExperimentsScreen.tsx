import type React from 'react';

import {useExperimentsStore} from '@sharedClient/stores/ExperimentsStore';

import {FlexColumn} from '@src/components/atoms/Flex';
import {Text} from '@src/components/atoms/Text';
import {ExperimentRow} from '@src/components/experiments/ExperimentRow';
import {LoadingArea} from '@src/components/loading/LoadingArea';

import {Screen} from '@src/screens/Screen';

const ExperimentsScreenMainContent: React.FC = () => {
  const accountExperiments = useExperimentsStore((state) => state.experiments);

  return (
    <FlexColumn flex={1} gap={6} padding={5} overflow="auto">
      <Text as="h2" bold>
        Experiments
      </Text>

      <FlexColumn gap={2}>
        <Text as="p" light>
          Configure experimental features and settings. Changes are saved automatically.
        </Text>
      </FlexColumn>

      {accountExperiments === null ? (
        <LoadingArea text="Loading experiments..." />
      ) : accountExperiments.length === 0 ? (
        <Text>No experiments available</Text>
      ) : (
        <FlexColumn gap={3}>
          {accountExperiments.map((accountExperiment) => (
            <ExperimentRow
              key={accountExperiment.definition.experimentId}
              accountExperiment={accountExperiment}
            />
          ))}
        </FlexColumn>
      )}
    </FlexColumn>
  );
};

export const ExperimentsScreen: React.FC = () => {
  return (
    <Screen withHeader withLeftSidebar>
      <ExperimentsScreenMainContent />
    </Screen>
  );
};
