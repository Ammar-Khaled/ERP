import { DataSource } from "typeorm";
import { ReturnPurchaseItem } from "./entities/return_purchase_item.entity";

export const returnPurchaseItemProviders = [
    {
        provide: 'RETURN_PURCHASE_ITEM_REPOSITORY',
        useFactory: (dataSource: DataSource) => dataSource.getRepository(ReturnPurchaseItem),
        inject: ['DATA_SOURCE'],
    }
]