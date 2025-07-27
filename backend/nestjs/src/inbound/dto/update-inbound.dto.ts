import { IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateInboundDto {
  rowStatus?: 'INSERT' | 'UPDATE' | 'DELETE';

  @IsString()
  @IsOptional()
  stock_code?: string;
  @IsInt()
  @IsOptional()
  quantity?: number;

  @IsString()
  @IsOptional()
  unit?: string;

  @IsInt()
  @IsOptional()
  max_use_period?: number;

  @IsString()
  @IsOptional()
  remark?: string;

  @Type(() => Date)
  @IsOptional()
  inbound_date?: Date;
}
