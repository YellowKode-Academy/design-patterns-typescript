export class AppConfig {
  private static instance: AppConfig | null = null;
  readonly dbUrl: string;
  readonly jwtSecret: string;
  readonly stripeKey: string;

  private constructor() {
    this.dbUrl = process.env.DATABASE_URL ?? 'postgres://localhost/shopapi';
    this.jwtSecret = process.env.JWT_SECRET ?? 'dev-secret';
    this.stripeKey = process.env.STRIPE_SECRET_KEY ?? '';
  }

  static getInstance(): AppConfig {
    if (AppConfig.instance === null) {
      AppConfig.instance = new AppConfig();
    }
    return AppConfig.instance;
  }

  static resetForTesting(): void {
    AppConfig.instance = null;
  }
}
