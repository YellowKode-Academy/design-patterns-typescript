type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export class Logger {
  private static instance: Logger | null = null;
  private logs: Array<{ level: LogLevel; message: string; data?: unknown }> = [];

  private constructor() {}

  static getInstance(): Logger {
    if (Logger.instance === null) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  debug(message: string, data?: unknown): void {
    this.logs.push({ level: 'debug', message, data });
  }

  info(message: string, data?: unknown): void {
    this.logs.push({ level: 'info', message, data });
  }

  warn(message: string, data?: unknown): void {
    this.logs.push({ level: 'warn', message, data });
  }

  error(message: string, data?: unknown): void {
    this.logs.push({ level: 'error', message, data });
  }

  getLogs(): Array<{ level: LogLevel; message: string; data?: unknown }> {
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
  }

  static resetForTesting(): void {
    Logger.instance = null;
  }
}
