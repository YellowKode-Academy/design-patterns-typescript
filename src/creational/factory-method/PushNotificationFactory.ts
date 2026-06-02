import { Notification } from './Notification';
import { NotificationFactory } from './NotificationFactory';
import { PushNotification } from './PushNotification';

export class PushNotificationFactory extends NotificationFactory {
  createNotification(): Notification {
    return new PushNotification();
  }
}
