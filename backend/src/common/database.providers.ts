import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

export const databaseProviders = [
  {
    provide: 'DATA_SOURCE',
    useFactory: async () => {
      // Use test database configuration during testing
      const isTestEnvironment =
        process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID;

      const dataSource = new DataSource({
        type: 'mysql',
        host: isTestEnvironment
          ? process.env.TEST_DB_HOST ||
            process.env.DB_HOST ||
            'mysql-erp-amarkhaled701-e559.g.aivencloud.com'
          : process.env.DB_HOST,
        port: isTestEnvironment
          ? Number(process.env.TEST_DB_PORT || process.env.DB_PORT || 27522)
          : Number(process.env.DB_PORT),
        username: isTestEnvironment
          ? process.env.TEST_DB_USERNAME ||
            process.env.DB_USERNAME ||
            'avnadmin'
          : process.env.DB_USERNAME,
        password: isTestEnvironment
          ? process.env.TEST_DB_PASSWORD ||
            process.env.DB_PASSWORD ||
            'AVNS_hDwhDhxktie6lTcPQ9q'
          : process.env.DB_PASSWORD,
        database: isTestEnvironment
          ? process.env.TEST_DB_NAME || 'erp_test'
          : process.env.DB_DATABASE,
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        synchronize: true,
        // Add SSL and connection options for cloud database during tests
        ssl: isTestEnvironment
          ? {
              rejectUnauthorized: false,
            }
          : undefined,
        connectTimeout: isTestEnvironment ? 60000 : undefined,
        acquireTimeout: isTestEnvironment ? 60000 : undefined,
        extra: isTestEnvironment
          ? {
              charset: 'utf8mb4_unicode_ci',
            }
          : undefined,
      });

      return dataSource.initialize();
    },
  },
];
