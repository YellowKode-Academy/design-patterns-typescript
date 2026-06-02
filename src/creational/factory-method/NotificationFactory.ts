import { Notification } from './Notification';

export abstract class NotificationFactory {
  abstract createNotification(): Notification;

  async notify(recipient: string, message: string): Promise<void> {
    const notification = this.createNotification();
    await notification.send(recipient, message);
  }
}
