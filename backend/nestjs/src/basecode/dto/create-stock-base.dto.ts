import { IsString, IsOptional, IsInt, IsBoolean } from 'class-validator';

export class CreateStockBaseDto {
  @IsString()
  code: string;

  @IsString()
  name: string;

  @IsString()
  category: string;

  @IsString()
  unit: string;

  @IsInt()
  @IsOptional()
  max_use_period?: number;

  @IsString()
  @IsOptional()
  remark?: string;

  @IsBoolean()
  @IsOptional()
  isAlert?: boolean;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
