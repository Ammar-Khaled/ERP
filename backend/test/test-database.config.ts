import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const testDatabaseConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: 'mysql-erp-amarkhaled701-e559.g.aivencloud.com',
  port: 27522,
  username: 'avnadmin',
  password: 'AVNS_hDwhDhxktie6lTcPQ9q',
  database: 'erp_test',
  entities: [__dirname + '/../src/**/*.entity{.ts,.js}'],
  synchronize: true,
  dropSchema: true,
  logging: false,
};
