type ConsoleColor = 'black' | 'green' | 'yellow' | 'red';

class Logger {
  private logInternal(
    message: string,
    data: Record<string, unknown> | undefined,
    color: ConsoleColor = 'black'
  ): void {
    if (typeof data === 'undefined') {
      // eslint-disable-next-line no-console
      console.log(`%c${message}`, `color: ${color};`);
    } else {
      // eslint-disable-next-line no-console
      console.log(`%c${message}`, `color: ${color};`, data);
    }
  }

  /** Passthrough to `console.log`. */
  public log(...args: unknown[]): void {
    // eslint-disable-next-line no-console
    console.log(...args);
  }

  public warning(message: string, data?: Record<string, unknown>): void {
    this.logInternal(`[WARNING] ${message}`, data, 'yellow');
  }

  public error(message: string, data?: Record<string, unknown>): void {
    const {error, ...otherData} = data ?? {};
    const errorData: Record<string, unknown> = {
      error: error instanceof Error ? error : new Error(message),
      ...otherData,
    };
    if (error && !(error instanceof Error)) {
      this.logInternal(
        `[ERROR] logger.error() called with non-error`,
        {invalidError: error},
        'red'
      );
    }
    this.logInternal(`[ERROR] ${message}`, errorData, 'red');
  }
}

export const logger = new Logger();
