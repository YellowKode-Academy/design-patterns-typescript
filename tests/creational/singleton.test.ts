import { AppConfig } from '../../src/creational/singleton/AppConfig';
import { Logger } from '../../src/creational/singleton/Logger';
import { DatabaseConnection } from '../../src/creational/singleton/DatabaseConnection';

beforeEach(() => {
  AppConfig.resetForTesting();
  Logger.resetForTesting();
  DatabaseConnection.resetForTesting();
});

describe('AppConfig Singleton', () => {
  it('retorna sempre a mesma instancia', () => {
    const a = AppConfig.getInstance();
    const b = AppConfig.getInstance();
    expect(a).toBe(b);
  });

  it('usa valores padrao quando variaveis de ambiente nao estao definidas', () => {
    const config = AppConfig.getInstance();
    expect(config.dbUrl).toBe('postgres://localhost/shopapi');
    expect(config.jwtSecret).toBe('dev-secret');
    expect(config.stripeKey).toBe('');
  });

  it('usa variaveis de ambiente quando definidas', () => {
    process.env.DATABASE_URL = 'postgres://myserver/mydb';
    process.env.JWT_SECRET = 'super-secret';
    process.env.STRIPE_SECRET_KEY = 'sk_test_abc';

    const config = AppConfig.getInstance();
    expect(config.dbUrl).toBe('postgres://myserver/mydb');
    expect(config.jwtSecret).toBe('super-secret');
    expect(config.stripeKey).toBe('sk_test_abc');

    delete process.env.DATABASE_URL;
    delete process.env.JWT_SECRET;
    delete process.env.STRIPE_SECRET_KEY;
  });

  it('resetForTesting permite criar nova instancia', () => {
    const a = AppConfig.getInstance();
    AppConfig.resetForTesting();
    const b = AppConfig.getInstance();
    expect(a).not.toBe(b);
  });
});

describe('Logger Singleton', () => {
  it('retorna sempre a mesma instancia', () => {
    const a = Logger.getInstance();
    const b = Logger.getInstance();
    expect(a).toBe(b);
  });

  it('logs acumulam corretamente', () => {
    const logger = Logger.getInstance();
    logger.info('evento 1');
    logger.info('evento 2');
    logger.error('falha grave');

    const logs = logger.getLogs();
    expect(logs).toHaveLength(3);
    expect(logs[0]).toMatchObject({ level: 'info', message: 'evento 1' });
    expect(logs[2]).toMatchObject({ level: 'error', message: 'falha grave' });
  });

  it('clearLogs limpa todos os registros', () => {
    const logger = Logger.getInstance();
    logger.info('mensagem');
    logger.clearLogs();
    expect(logger.getLogs()).toHaveLength(0);
  });

  it('log preserva dados extras', () => {
    const logger = Logger.getInstance();
    logger.error('produto nao encontrado', { productId: 'p42' });
    const logs = logger.getLogs();
    expect(logs[0].data).toEqual({ productId: 'p42' });
  });

  it('getLogs retorna copia imutavel', () => {
    const logger = Logger.getInstance();
    logger.info('original');
    const logs = logger.getLogs();
    logs.push({ level: 'warn', message: 'intruso' });
    expect(logger.getLogs()).toHaveLength(1);
  });
});

describe('DatabaseConnection Singleton', () => {
  it('retorna a mesma instancia', () => {
    const a = DatabaseConnection.getInstance();
    const b = DatabaseConnection.getInstance();
    expect(a).toBe(b);
  });

  it('lanca erro ao fazer query sem conexao', () => {
    const db = DatabaseConnection.getInstance();
    expect(() => db.query('SELECT 1')).toThrow('Not connected to database');
  });

  it('aceita queries apos conectar', () => {
    const db = DatabaseConnection.getInstance();
    db.connect();
    expect(db.isConnected()).toBe(true);
    const result = db.query('SELECT 1');
    expect(result).toHaveProperty('rows');
    db.disconnect();
    expect(db.isConnected()).toBe(false);
  });
});
