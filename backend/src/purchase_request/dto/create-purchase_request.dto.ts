import { Type } from "class-transformer";
import { IsDate, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreatePurchaseRequestDto {
    @IsOptional() // if not provided, use the current date as a default
    @Type(() => Date) // converts input to date
    @IsDate()
    date: Date;

    @IsNotEmpty()
    @IsString()
    userName: string;
    
    @IsNotEmpty()
    @IsString()
    branchName: string;
    
    @IsNotEmpty()
    @IsString()
    supplierName: string;

    @IsOptional()
    @IsString()
    status?: string;
    
    @IsNotEmpty()
    @IsString()
    currency: string;
}
