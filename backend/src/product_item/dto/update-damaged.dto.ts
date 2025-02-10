import { IsInt, IsNotEmpty } from 'class-validator';

export class UpdateDamagedDto {
  @IsInt()
  @IsNotEmpty()
  product_item_id: number;

  @IsInt()
  @IsNotEmpty()
  numberOfDamaged: number;
}
