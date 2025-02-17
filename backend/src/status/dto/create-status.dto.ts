import { IsNotEmpty, IsOptional, IsString, Max } from "class-validator";

export class CreateStatusDto {
    @IsNotEmpty()
    @IsString()
    @Max(10)
    statusName: string;

    @IsOptional()
    @IsString()
    statusDescription: string;
}
