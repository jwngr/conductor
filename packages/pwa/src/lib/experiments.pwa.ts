import {ExperimentsService} from '@shared/services/experiments.shared';

import {Environment} from '@shared/types/environment.types';
import type {ExperimentVisibility} from '@shared/types/experiments.types';

export class PWAExperimentsService extends ExperimentsService {
  constructor(args: {readonly visibilityAccess: ExperimentVisibility}) {
    super({
      environment: Environment.PWA,
      visibilityAccess: args.visibilityAccess,
    });
  }
}

// export const pwaExperimentsService = new ExperimentsService({
//   environment: Environment.PWA,
//   visibilityAccess: ExperimentVisibility.Internal,
// });

export const pwaExperimentsService = new PWAExperimentsService({
  visibilityAccess: ExperimentVisibility.Internal,
});
