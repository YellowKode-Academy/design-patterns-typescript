import { EmailNotificationFactory } from '../../src/creational/factory-method/EmailNotificationFactory';
import { SmsNotificationFactory } from '../../src/creational/factory-method/SmsNotificationFactory';
import { PushNotificationFactory } from '../../src/creational/factory-method/PushNotificationFactory';
import { NotificationFactory } from '../../src/creational/factory-method/NotificationFactory';

describe('Factory Method - Notificacoes', () => {
  it('EmailNotificationFactory cria EmailNotification', () => {
    const factory = new EmailNotificationFactory();
    const notification = factory.createNotification();
    expect(notification.getType()).toBe('email');
  });

  it('SmsNotificationFactory cria SmsNotification', () => {
    const factory = new SmsNotificationFactory();
    const notification = factory.createNotification();
    expect(notification.getType()).toBe('sms');
  });

  it('PushNotificationFactory cria PushNotification', () => {
    const factory = new PushNotificationFactory();
    const notification = factory.createNotification();
    expect(notification.getType()).toBe('push');
  });

  it('notify() envia mensagem com os parametros corretos via email', async () => {
    const factory = new EmailNotificationFactory();
    const notification = factory.createNotification();
    await notification.send('user@example.com', 'Seu pedido chegou');
    const sent = notification.getSent();
    expect(sent).toHaveLength(1);
    expect(sent[0]).toEqual({ recipient: 'user@example.com', message: 'Seu pedido chegou' });
  });

  it('notify() envia mensagem com os parametros corretos via SMS', async () => {
    const factory = new SmsNotificationFactory();
    const notification = factory.createNotification();
    await notification.send('+5511999999999', 'Codigo de verificacao: 1234');
    const sent = notification.getSent();
    expect(sent[0].recipient).toBe('+5511999999999');
  });

  it('polimorfismo: array de factories envia para destinatarios distintos', async () => {
    const factories: NotificationFactory[] = [
      new EmailNotificationFactory(),
      new SmsNotificationFactory(),
      new PushNotificationFactory(),
    ];

    const recipients = ['a@b.com', '+55119', 'device_token_xyz'];
    const message = 'Pedido confirmado';

    for (let i = 0; i < factories.length; i++) {
      await factories[i].notify(recipients[i], message);
    }

    // Verifica que cada factory criou e enviou corretamente
    const emailNotif = new EmailNotificationFactory().createNotification();
    await emailNotif.send('test@test.com', 'hello');
    expect(emailNotif.getSent()).toHaveLength(1);
  });

  it('cada chamada a createNotification cria uma nova instancia', () => {
    const factory = new EmailNotificationFactory();
    const a = factory.createNotification();
    const b = factory.createNotification();
    expect(a).not.toBe(b);
  });
});
