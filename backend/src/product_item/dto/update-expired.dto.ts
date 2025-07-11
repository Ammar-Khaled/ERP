import { IsInt, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateExpiredDto {
  @IsInt()
  @IsNotEmpty()
  productItemId: number;

  @IsInt()
  @IsNotEmpty()
  inventoryId: number;

  @IsInt()
  @IsOptional()
  quantity?: number; // Optional parameter to specify how many items expired
}
