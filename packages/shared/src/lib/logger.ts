type ConsoleColor = 'black' | 'green' | 'yellow' | 'red';

export class Logger {
  private logInternal(
    message: string,
    data?: object | undefined,
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

  public info(message: string, data?: object): void {
    this.logInternal(`[INFO] ${message}`, data, 'black');
  }

  public warning(message: string, data?: object): void {
    this.logInternal(`[WARNING] ${message}`, data, 'yellow');
  }

  public error(message: string, data?: object): void {
    this.logInternal(`[ERROR] ${message}`, data, 'red');
  }

  public critical(message: string, data?: object): void {
    this.logInternal(`[CRITICAL] ${message}`, data, 'red');
  }
}
