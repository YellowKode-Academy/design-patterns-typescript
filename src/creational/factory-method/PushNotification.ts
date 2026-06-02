import { Notification } from './Notification';

export class PushNotification implements Notification {
  private sent: Array<{ recipient: string; message: string }> = [];

  async send(recipient: string, message: string): Promise<void> {
    this.sent.push({ recipient, message });
  }

  getType(): string {
    return 'push';
  }

  getSent(): Array<{ recipient: string; message: string }> {
    return [...this.sent];
  }
}
