import { IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateOutboundDto {
  @IsInt()
  @IsOptional()
  quantity?: number;

  @IsString()
  @IsOptional()
  remark?: string;
}
