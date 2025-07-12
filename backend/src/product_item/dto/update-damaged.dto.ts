import { IsArray, IsInt, IsNotEmpty, ValidateNested } from 'class-validator';

import { Type } from 'class-transformer';

class UpdateDamagedItemDto {
  @IsInt()
  @IsNotEmpty()
  productItemId: number;

  @IsInt()
  @IsNotEmpty()
  inventoryId: number;

  @IsInt()
  @IsNotEmpty()
  numberOfDamaged: number; // added number of damaged items
}

export class UpdateDamagedDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateDamagedItemDto)
  items: UpdateDamagedItemDto[];
}
