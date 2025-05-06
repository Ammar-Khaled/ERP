import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class UpdateReturnItemDto {
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  numberOfItems: number;
}
