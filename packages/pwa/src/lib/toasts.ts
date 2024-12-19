import {useEffect, useState} from 'react';

import {makeId} from '@shared/lib/utils';

import {Consumer, Task} from '@shared/types/utils.types';

import type {ToastActionElement, ToastProps} from '@src/components/atoms/Toast';

const TOAST_LIMIT = 1;
const TOAST_REMOVE_DELAY_MS = 1_000_000;

export enum ToastType {
  Info = 'INFO',
  Error = 'ERROR',
}

type ToastComponentProps = Omit<ToastProps, 'type'> & {
  readonly message: React.ReactNode;
  readonly type?: ToastType;
  readonly title?: React.ReactNode;
  readonly action?: ToastActionElement;
};

type ToasterToast = ToastProps & {
  readonly toastId: string;
  readonly title?: React.ReactNode;
  readonly description?: React.ReactNode;
  readonly action?: ToastActionElement;
};

enum ToastActionType {
  AddToast = 'ADD_TOAST',
  UpdateToast = 'UPDATE_TOAST',
  DismissToast = 'DISMISS_TOAST',
  RemoveToast = 'REMOVE_TOAST',
}

type Action =
  | {
      actionType: ToastActionType.AddToast;
      toastType: ToastType;
      toast: ToasterToast;
    }
  | {
      actionType: ToastActionType.UpdateToast;
      toastType: ToastType;
      toast: Partial<ToasterToast>;
    }
  | {
      actionType: ToastActionType.DismissToast;
      toastId?: ToasterToast['toastId'];
    }
  | {
      actionType: ToastActionType.RemoveToast;
      toastId?: ToasterToast['toastId'];
    };

interface ToastState {
  readonly toasts: ToasterToast[];
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return;
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({
      actionType: ToastActionType.RemoveToast,
      toastId,
    });
  }, TOAST_REMOVE_DELAY_MS);

  toastTimeouts.set(toastId, timeout);
};

export const reducer = (state: ToastState, action: Action): ToastState => {
  switch (action.actionType) {
    case ToastActionType.AddToast:
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };

    case ToastActionType.UpdateToast:
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.toastId === action.toast.toastId ? {...t, ...action.toast} : t
        ),
      };

    case ToastActionType.DismissToast: {
      const {toastId} = action;

      if (toastId) {
        addToRemoveQueue(toastId);
      } else {
        state.toasts.forEach((toast) => addToRemoveQueue(toast.toastId));
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.toastId === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      };
    }
    case ToastActionType.RemoveToast:
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        };
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.toastId !== action.toastId),
      };
  }
};

const listeners: Array<Consumer<ToastState>> = [];

let memoryState: ToastState = {toasts: []};

function dispatch(action: Action): void {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => {
    listener(memoryState);
  });
}

interface ShowToastResult {
  readonly toastId: string;
  readonly dismiss: Task;
  readonly update: Consumer<ToasterToast>;
}

function showToast({
  // TODO: Add visual styling support for error toasts.
  type: toastType = ToastType.Info,
  message,
  title,
  action,
  ...toastProps
}: ToastComponentProps): ShowToastResult {
  const toastId = makeId();

  const update = (updateProps: ToasterToast) =>
    dispatch({
      actionType: ToastActionType.UpdateToast,
      toastType,
      toast: {...updateProps, toastId},
    });

  const dismiss = () => dispatch({actionType: ToastActionType.DismissToast, toastId});

  dispatch({
    actionType: ToastActionType.AddToast,
    toastType,
    toast: {
      ...toastProps,
      description: message,
      title,
      action,
      toastId,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss();
      },
    },
  });

  return {
    toastId,
    dismiss,
    update,
  };
}

interface UseToastResult {
  readonly toasts: ToasterToast[];
  readonly showToast: typeof showToast;
  readonly showErrorToast: typeof showToast;
  readonly hideToast: Consumer<string>;
}

export function useToast(): UseToastResult {
  const [state, setState] = useState<ToastState>(memoryState);

  useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, [state]);

  return {
    toasts: state.toasts,
    showToast,
    showErrorToast: (props) => showToast({...props, type: ToastType.Error}),
    hideToast: (toastId) => dispatch({actionType: ToastActionType.DismissToast, toastId}),
  };
}
