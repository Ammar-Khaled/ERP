import { DataSource } from "typeorm";
import { Return } from "./entities/return.entity";

export const returnProviders = [
    {
        provide: 'RETURN_REPOSITORY',
        useFactory: (dataSource: DataSource) => dataSource.getRepository(Return),
        inject: ['DATA_SOURCE'],
    }
]