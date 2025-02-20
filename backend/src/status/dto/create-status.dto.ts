import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateStatusDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(10)
  name: string;

  @IsOptional()
  @IsString()
  description: string;
}
