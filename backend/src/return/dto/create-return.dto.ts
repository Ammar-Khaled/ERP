import { Type } from "class-transformer";
import { IsInt, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { CreateReturnItemDto } from "src/return_item/dto/create-return_item.dto";

export class CreateReturnDto {
    // get from the user: optional date, reason, return item dtos, order id, status id, product item ids

    @IsOptional()
    @Type(() => Date)
    date?: Date;

    @IsOptional()
    @IsString()
    reason?: string;

    @IsNotEmpty()
    returnItemDtos: CreateReturnItemDto[];

    @IsNotEmpty()
    @IsInt()
    orderId: number;

    @IsNotEmpty()
    @IsInt()
    statusId: number;
}
