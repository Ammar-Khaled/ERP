import { IsNotEmpty, IsNumber, IsPositive, Min } from "class-validator";

export class CreateReturnPurchaseItemDto {
    @IsNotEmpty()
    @IsNumber()
    purchaseItemId: number;

    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    numberOfReturned: number;

    @IsNotEmpty()
    @IsNumber()
    returnPurchaseId: number;
}