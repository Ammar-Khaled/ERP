import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreatePurchaseEntityDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    description?: string;
}
