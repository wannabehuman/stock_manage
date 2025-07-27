import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { OutboundService } from './outbound.service';
import { CreateOutboundDto } from './dto/create-outbound.dto';
import { UpdateOutboundDto } from './dto/update-outbound.dto';

@Controller('outbound')
export class OutboundController {
  constructor(private readonly outboundService: OutboundService) {}

  @Get()
  async findAll() {
    return this.outboundService.findAll();
  }

  @Get('outbound/:stock_code')
  async findByInbound(@Param('stock_code') stock_code: string) {
    return this.outboundService.findByInbound(stock_code);
  }

  @Get('outbound/date/:outboundDate')
  async findByDate(@Param('outboundDate') outboundDate: string) {
    return this.outboundService.findByDate(new Date(outboundDate));
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.outboundService.findOne(id);
  }

  @Post()
  async create(@Body() createOutboundDto: CreateOutboundDto) {
    return this.outboundService.create(createOutboundDto);
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateOutboundDto: UpdateOutboundDto
  ) {
    return this.outboundService.update(id, updateOutboundDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return this.outboundService.remove(id);
  }
}
