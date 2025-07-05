import { Transform, Type } from 'class-transformer';
import { IsDate, IsNotEmpty, ValidateNested } from 'class-validator';
import { CreatePurchaseItemDto } from 'src/purchase_request/dto/create-purchase_item.dto';

export class CreatePurchaseRequestDto {
  @Transform(({ value }) => (value !== undefined ? value : new Date()))
  @Type(() => Date) // converts input to date
  @IsDate()
  date: Date;

  @IsNotEmpty()
  userId: number;

  @IsNotEmpty()
  branchId: number;

  @IsNotEmpty()
  supplierId: number;

  @IsNotEmpty()
  currencyId: number;

  @IsNotEmpty()
  inventoryId: number;

  @IsNotEmpty()
  @ValidateNested({ each: true }) // Validates each element in the array
  @Type(() => CreatePurchaseItemDto) // Transforms each element to CreatePurchaseItemDto
  purchaseItemsDtos: CreatePurchaseItemDto[];
}
