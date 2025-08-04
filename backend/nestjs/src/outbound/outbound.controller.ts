import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { OutboundService } from './outbound.service';
import { CreateOutboundDto } from './dto/create-outbound.dto';
import { UpdateOutboundDto } from './dto/update-outbound.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('outbound')
export class OutboundController {
  constructor(private readonly outboundService: OutboundService) {}

  @Get()
  async findAll() {
    return this.outboundService.findAll();
  }

  @Get('stock/:stock_code')
  async findByStock(@Param('stock_code') stock_code: string) {
    return this.outboundService.findByStock(stock_code);
  }

  @Get('date/:outboundDate')
  async findByDate(@Param('outboundDate') outboundDate: string) {
    return this.outboundService.findByDate(new Date(outboundDate));
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.outboundService.findOne(id);
  }

  // 출고 추가, 수정, 삭제
  @Post()
  @UseGuards(AuthGuard('jwt'))
  async save(@Body() outboundDtos: (CreateOutboundDto | UpdateOutboundDto)[]) {
    return this.outboundService.save(outboundDtos);
  }

  @Post('single')
  @UseGuards(AuthGuard('jwt'))
  async create(@Body() createOutboundDto: CreateOutboundDto) {
    return this.outboundService.create(createOutboundDto);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  async update(
    @Param('id') id: number,
    @Body() updateOutboundDto: UpdateOutboundDto
  ) {
    return this.outboundService.update(id, updateOutboundDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async remove(@Param('id') id: number) {
    return this.outboundService.remove(id);
  }
}
