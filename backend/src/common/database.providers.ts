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
          ? process.env.TEST_DB_HOST
          : process.env.DB_HOST,
        port: isTestEnvironment
          ? Number(process.env.TEST_DB_PORT)
          : Number(process.env.DB_PORT),
        username: isTestEnvironment
          ? process.env.TEST_DB_USERNAME
          : process.env.DB_USERNAME,
        password: isTestEnvironment
          ? process.env.TEST_DB_PASSWORD
          : process.env.DB_PASSWORD,
        database: isTestEnvironment
          ? process.env.TEST_DB_NAME
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
      });

      return dataSource.initialize();
    },
  },
];
