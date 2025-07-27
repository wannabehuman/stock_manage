import { IsString, IsInt, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateInboundDto {
  rowStatus: 'INSERT' | 'UPDATE' | 'DELETE';

  @IsString()
  stock_code: string;

  @IsInt()
  quantity: number;

  @IsString()
  unit: string;

  @Type(() => Date)
  inbound_date: Date;

  @IsInt()
  @IsOptional()
  max_use_period?: number;

  @IsString()
  @IsOptional()
  remark?: string;
}
