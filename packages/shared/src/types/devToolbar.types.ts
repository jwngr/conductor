import {Func, Task, Unsubscribe} from '@shared/types/utils.types';

export interface DevToolbarAction {
  readonly actionId: string;
  readonly text: string;
  readonly onClick: Task;
}

export interface DevToolbarStore {
  readonly actions: readonly DevToolbarAction[];
  readonly registerAction: Func<DevToolbarAction, Unsubscribe>;
}
