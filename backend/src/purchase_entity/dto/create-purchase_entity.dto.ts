import { IsOptional, IsString } from "class-validator";

export class CreatePurchaseEntityDto {
    @IsOptional()
    @IsString()
    description?: string;
}
