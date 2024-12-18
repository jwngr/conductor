import React, {ReactNode} from 'react';

import {upgradeUnknownError} from '@shared/lib/errors';

import {Func} from '@shared/types/utils.types';

interface ErrorBoundaryProps {
  readonly fallback: Func<Error, ReactNode>;
  readonly children: ReactNode;
  readonly onError?: (error: Error, componentStack: string) => void;
}

interface ErrorBoundaryState {
  readonly error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {error: null};
  }

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    const safeError = upgradeUnknownError(error);
    return {error: safeError};
  }

  componentDidCatch(error: unknown, info: {componentStack: string}): void {
    const safeError = upgradeUnknownError(error);
    this.props.onError?.(safeError, info.componentStack);
  }

  render(): ReactNode {
    if (this.state.error) {
      return this.props.fallback(this.state.error);
    }

    return this.props.children;
  }
}