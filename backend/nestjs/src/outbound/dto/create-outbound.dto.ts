import { IsDate, IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOutboundDto {
  @Type(() => Date)
  @IsDate()
  outboundDate: Date;

  @IsInt()
  quantity: number;

  @IsString()
  stock_code: string;

  @Type(() => Date)
  @IsDate()
  inbound_date: Date;

  @IsString()
  @IsOptional()
  remark?: string;
}
