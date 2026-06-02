import { Notification } from './Notification';

export class SmsNotification implements Notification {
  private sent: Array<{ recipient: string; message: string }> = [];

  async send(recipient: string, message: string): Promise<void> {
    this.sent.push({ recipient, message });
  }

  getType(): string {
    return 'sms';
  }

  getSent(): Array<{ recipient: string; message: string }> {
    return [...this.sent];
  }
}
