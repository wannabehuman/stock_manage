import { IsDate, IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateOutboundDto {
  @IsInt()
  @IsOptional()
  id?: number;

  @IsString()
  @IsOptional()
  stock_code?: string;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  inbound_date?: Date;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  outboundDate?: Date;

  @IsInt()
  @IsOptional()
  quantity?: number;

  @IsString()
  @IsOptional()
  unit?: string;

  @IsString()
  @IsOptional()
  remark?: string;

  @IsString()
  @IsOptional()
  rowStatus?: string;
}
