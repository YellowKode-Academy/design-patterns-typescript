export class DatabaseConnection {
  private static instance: DatabaseConnection | null = null;
  private connected = false;
  private queryCount = 0;

  private constructor(private readonly url: string) {}

  static getInstance(url?: string): DatabaseConnection {
    if (DatabaseConnection.instance === null) {
      DatabaseConnection.instance = new DatabaseConnection(
        url ?? 'postgres://localhost/shopapi'
      );
    }
    return DatabaseConnection.instance;
  }

  connect(): void {
    this.connected = true;
  }

  disconnect(): void {
    this.connected = false;
  }

  isConnected(): boolean {
    return this.connected;
  }

  query(sql: string): { rows: unknown[] } {
    if (!this.connected) {
      throw new Error('Not connected to database');
    }
    this.queryCount++;
    return { rows: [] };
  }

  getQueryCount(): number {
    return this.queryCount;
  }

  getUrl(): string {
    return this.url;
  }

  static resetForTesting(): void {
    DatabaseConnection.instance = null;
  }
}
