import { Type } from "class-transformer";
import { IsArray, IsDate, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";
import { ReturnPurchaseItem } from "../entities/return_purchase_item.entity";

export class CreateReturnPurchaseDto {
    @IsOptional()
    @Type(() => Date)
    date?: Date;

    // English and Arabic reasons
    @IsNotEmpty()
    @IsString()
    reason: string;

    @IsOptional()
    @IsString()
    reasonAr?: string;

    @IsNotEmpty()
    @IsNumber()
    purchaseRequestId: number;

    @IsNotEmpty()
    @IsArray()
    @ValidateNested({ each: true, always: true})
    @Type(() => ReturnPurchaseItem)
    returnPurchaseItems: ReturnPurchaseItem[];

    @IsNotEmpty()
    @IsNumber()
    statusId: number;
}
