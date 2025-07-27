import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { StockBaseService } from './stock-base.service';
import { CreateStockBaseDto } from './dto/create-stock-base.dto';
import { UpdateStockBaseDto } from './dto/update-stock-base.dto';

@Controller('stock-base')
export class StockBaseController {
  constructor(private readonly stockBaseService: StockBaseService) {}

  @Get()
  async findAll() {
    return this.stockBaseService.findAll();
  }

  @Get(':code')
  async findOne(@Param('code') code: string) {
    return this.stockBaseService.findOne(code);
  }
@Get('/category/:category')
async findByCategory(@Param('category') category: string) {
  return this.stockBaseService.findByCategory(category);
}
  @Post()
  async create(@Body() createStockBaseDto: CreateStockBaseDto) {
    return this.stockBaseService.create(createStockBaseDto);
  }

  @Put(':code')
  async update(@Param('code') code: string, @Body() updateStockBaseDto: UpdateStockBaseDto) {
    return this.stockBaseService.update(code, updateStockBaseDto);
  }

  @Delete(':code')
  async remove(@Param('code') code: string) {
    return this.stockBaseService.remove(code);
  }
}
