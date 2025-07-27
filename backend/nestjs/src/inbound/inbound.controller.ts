import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { InboundService } from './inbound.service';
import { CreateInboundDto } from './dto/create-inbound.dto';
import { UpdateInboundDto } from './dto/update-inbound.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/enums/role.enum';

@Controller('inbound')
export class InboundController {
  constructor(private readonly inboundService: InboundService) {}

  @Get()
  async findAll() {
    return this.inboundService.findAll();
  }

  @Get('stock/:stock_code')
  async findBystock_code(@Param('stock_code') stock_code: string) {
    return this.inboundService.findBystock_code(stock_code);
  }

  @Get('date/:inbound_date')
  async findByDate(@Param('inbound_date') inbound_date: string) {
    return this.inboundService.findByDate(new Date(inbound_date));
  }

  @Get(':stock_code/:inbound_date')
  async findOne(@Param('stock_code') stock_code: string, @Param('inbound_date') inbound_date: string) {
    return this.inboundService.findOne(stock_code, new Date(inbound_date));
  }

  // 재고 추가, 수정, 삭제
  @Post()
  @UseGuards(AuthGuard('jwt'))
  async save(@Body() inboundDtos: (CreateInboundDto | UpdateInboundDto)[]) {
    return this.inboundService.save(inboundDtos);
  }

  // @Put(':stock_code')
  // @UseGuards(AuthGuard('jwt'))
  // async update(
  //   @Param('stock_code') stock_code: string,
  //   @Body() inboundDto: UpdateInboundDto
  // ) {
  //   return this.inboundService.update(stock_code, inboundDto);
  // }

  // @Delete(':stock_code/:inbound_date')
  // @UseGuards(AuthGuard('jwt'))
  // async delete(
  //   @Param('stock_code') stock_code: string,
  //   @Param('inbound_date') inbound_date: string
  // ) {
  //   return this.inboundService.delete(stock_code, new Date(inbound_date));
  // }
}
