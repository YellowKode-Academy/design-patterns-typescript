import { Notification } from './Notification';
import { NotificationFactory } from './NotificationFactory';
import { EmailNotification } from './EmailNotification';

export class EmailNotificationFactory extends NotificationFactory {
  createNotification(): Notification {
    return new EmailNotification();
  }
}
