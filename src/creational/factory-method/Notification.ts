export interface Notification {
  send(recipient: string, message: string): Promise<void>;
  getType(): string;
  getSent(): Array<{ recipient: string; message: string }>;
}
