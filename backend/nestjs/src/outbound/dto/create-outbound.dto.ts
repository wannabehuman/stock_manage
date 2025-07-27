import { IsDate, IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOutboundDto {
  @IsString()
  stock_code: string;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  inbound_date?: Date;

  @Type(() => Date)
  @IsDate()
  outboundDate: Date;

  @IsInt()
  quantity: number;

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
