import type React from 'react';

import {useExperimentsStore} from '@sharedClient/stores/ExperimentsStore';

import {FlexColumn} from '@src/components/atoms/Flex';
import {H2, P} from '@src/components/atoms/Text';
import {ExperimentRow} from '@src/components/experiments/ExperimentRow';
import {LoadingArea} from '@src/components/loading/LoadingArea';

import {Screen} from '@src/screens/Screen';

const ExperimentsScreenMainContent: React.FC = () => {
  const accountExperiments = useExperimentsStore((state) => state.experiments);

  return (
    <FlexColumn flex gap={6} padding={5} overflow="auto">
      <H2 bold>Experiments</H2>

      <FlexColumn gap={2}>
        <P light>Configure experimental features and settings. Changes are saved automatically.</P>
      </FlexColumn>

      {accountExperiments === null ? (
        <LoadingArea text="Loading experiments..." />
      ) : accountExperiments.length === 0 ? (
        <P>No experiments available</P>
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
