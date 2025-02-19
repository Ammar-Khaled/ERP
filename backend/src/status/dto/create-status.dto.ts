import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateStatusDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(10)
  statusName: string;

  @IsOptional()
  @IsString()
  statusDescription: string;
}
