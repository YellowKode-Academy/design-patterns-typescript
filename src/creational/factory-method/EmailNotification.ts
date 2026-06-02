import { Notification } from './Notification';

export class EmailNotification implements Notification {
  private sent: Array<{ recipient: string; message: string }> = [];

  async send(recipient: string, message: string): Promise<void> {
    this.sent.push({ recipient, message });
  }

  getType(): string {
    return 'email';
  }

  getSent(): Array<{ recipient: string; message: string }> {
    return [...this.sent];
  }
}
