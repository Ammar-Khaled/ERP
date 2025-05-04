import { IsInt, IsNotEmpty } from 'class-validator';

export class UpdateDamagedDto {
  @IsInt()
  @IsNotEmpty()
  productItemId: number;

  @IsInt()
  @IsNotEmpty()
  numberOfDamaged: number;
}
