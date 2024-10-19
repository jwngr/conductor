type ConsoleColor = 'black' | 'green' | 'yellow' | 'red';

export class Logger {
  private logInternal(
    message: string,
    data?: Record<string, unknown> | undefined,
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
    this.logInternal(args.join(' '));
  }

  public warning(message: string, data?: Record<string, unknown>): void {
    this.logInternal(`[WARNING] ${message}`, data, 'yellow');
  }

  public error(message: string, data?: Record<string, unknown>): void {
    const {error, ...otherData} = data ?? {};
    const errorData = {
      error: error ?? new Error(message),
      ...otherData,
    };
    this.logInternal(`[ERROR] ${message}`, errorData, 'red');
  }
}
