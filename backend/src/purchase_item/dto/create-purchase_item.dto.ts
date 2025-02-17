import { Type } from "class-transformer";
import { IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Min, ValidateNested } from "class-validator";
import { CreatePurchaseEntityDto } from "src/purchase_entity/dto/create-purchase_entity.dto";

export class CreatePurchaseItemDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsNumber({allowNaN: false}, {message: 'Please enter a valid number!'})
    @Min(1, {message: 'Number of items should be at least 1!'})
    number_of_items: number;

    @IsNotEmpty()
    @IsNumber({allowNaN: false}, {message: 'Please enter a valid number!'})
    @IsPositive({message: 'Please enter a positive number!'})
    unit_price: number;

    
    //# todo: make it derived?
    @IsOptional()
    @IsNumber({allowNaN: false}, {message: 'Please enter a valid number!'})
    @IsPositive({message: 'Please enter a positive number!'})
    total_price?: number;

    //# discuss the relation b/w item and entity again
    @IsOptional()
    @ValidateNested()
    @Type(() => CreatePurchaseEntityDto)
    purchaseEntity?: CreatePurchaseEntityDto;
}
