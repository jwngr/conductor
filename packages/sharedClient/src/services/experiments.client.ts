// export class ClientExperimentsService extends ExperimentsService {
//   constructor(args: {readonly visibilityAccess: ExperimentVisibility}) {
//     super({
//       environment: Environment.PWA,
//       visibilityAccess: args.visibilityAccess,
//     });
//   }
// }

// // export const pwaExperimentsService = new ExperimentsService({
// //   environment: Environment.PWA,
// //   visibilityAccess: ExperimentVisibility.Internal,
// // });

// export const pwaExperimentsService = new ClientExperimentsService({
//   visibilityAccess: ExperimentVisibility.Internal,
// });

// export function useExperimentsService(args: {
//   readonly environment: ClientEnvironment;
//   readonly visibilityAccess: ExperimentVisibility;
// }): ClientExperimentsService {
//   const {visibilityAccess} = args;

//   const loggedInAccount = useLoggedInAccount();

//   const experimentsService = useMemo(() => {
//     return new ExperimentsService({
//       environment,
//       accountId: loggedInAccount.accountId,
//     });
//   }, [environment, loggedInAccount.accountId]);

//   return experimentsService;
// }

import {ALL_EXPERIMENT_DEFINITIONS} from '@shared/lib/experimentDefinitions.shared';
import {
  isExperimentEnabledForEnvironment,
  isExperimentVisible,
} from '@shared/lib/experiments.shared';

import type {Environment} from '@shared/types/environment.types';
import type {
  ExperimentDefinition,
  ExperimentId,
  ExperimentVisibility,
} from '@shared/types/experiments.types';

import type {ClientFirestoreCollectionService} from '@sharedClient/services/firestore.client';

type ClientAccountExperimentsCollectionService = ClientFirestoreCollectionService<
  ExperimentId,
  ExperimentDefinition
>;

export class ClientExperimentsService {
  private readonly environment: Environment;
  private readonly visibilityAccess: ExperimentVisibility;
  private readonly experiments: readonly ExperimentDefinition[];
  private readonly accountExperimentsCollectionService: ClientAccountExperimentsCollectionService;

  constructor(args: {
    readonly environment: Environment;
    readonly accountId: AccountId;
    readonly visibilityAccess: ExperimentVisibility;
  }) {
    const {environment, accountId, visibilityAccess} = args;

    this.environment = environment;
    this.accountId = accountId;
    this.visibilityAccess = visibilityAccess;

    this.experiments = ALL_EXPERIMENT_DEFINITIONS.filter(
      (experiment) =>
        isExperimentEnabledForEnvironment({experiment, environment}) &&
        isExperimentVisible({experiment, viewerAccess: this.visibilityAccess})
    );
  }

  public getExperiment(id: ExperimentId): ExperimentDefinition | undefined {
    return this.experiments.find((experiment) => experiment.id === id);
  }

  public getExperiments(): readonly ExperimentDefinition[] {
    return this.experiments;
  }

  public getActiveExperiments(): readonly ExperimentDefinition[] {
    return this.experiments.filter((experiment) =>
      isExperimentEnabledForEnvironment({experiment, environment: this.environment})
    );
  }

  public isExperimentEnabled(id: ExperimentId): boolean {
    const experiment = this.getExperiment(id);
    return (
      experiment !== undefined &&
      isExperimentEnabledForEnvironment({experiment, environment: this.environment})
    );
  }
}
