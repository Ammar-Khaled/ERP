import { DataSource } from "typeorm";
import { ReturnPurchase } from "./entities/return_purchase.entity";

export const returnPurchaseProviders = [
    {
        provide: 'RETURN_PURCHASE_REPOSITORY',
        useFactory: (dataSource: DataSource) => dataSource.getRepository(ReturnPurchase),
        inject: ['DATA_SOURCE'],
    }
]