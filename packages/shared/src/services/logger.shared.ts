type ConsoleColor = 'black' | 'green' | 'yellow' | 'red';

class SharedLoggerService {
  private logInternal(
    messageOrError: string | Error,
    data: Record<string, unknown> | undefined,
    color: ConsoleColor = 'black'
  ): void {
    if (typeof data === 'undefined') {
      // eslint-disable-next-line no-console
      console.log(`%c${messageOrError}`, `color: ${color};`);
    } else {
      // eslint-disable-next-line no-console
      console.log(`%c${messageOrError}`, `color: ${color};`, data);
    }
  }

  /** Passthrough to native logger. */
  public log(...args: unknown[]): void {
    // eslint-disable-next-line no-console
    console.log(...args);
  }

  public warn(message: string, data?: Record<string, unknown>): void {
    this.logInternal(`[WARNING] ${message}`, data, 'yellow');
  }

  public error(error: Error, data?: Record<string, unknown>): void {
    this.logInternal(error.message, {...data, error, cause: error.cause}, 'red');
  }
}

export const logger = new SharedLoggerService();
