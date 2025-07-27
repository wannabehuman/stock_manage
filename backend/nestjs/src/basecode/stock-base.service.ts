import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockBase } from './entities/stock-base.entity';
import { CreateStockBaseDto } from './dto/create-stock-base.dto';
import { UpdateStockBaseDto } from './dto/update-stock-base.dto';

@Injectable()
export class StockBaseService {
  constructor(
    @InjectRepository(StockBase)
    private stockBaseRepository: Repository<StockBase>,
  ) {}

  async findAll(): Promise<StockBase[]> {
    return this.stockBaseRepository.find();
  }

  async findOne(code: string): Promise<StockBase | null> {
    return this.stockBaseRepository.findOneBy({ code });
  }
  async findByCategory(category: string): Promise<StockBase[]> {
    return this.stockBaseRepository.find({ where: { category } });
  }
  async create(createStockBaseDto: CreateStockBaseDto): Promise<StockBase> {
    const stockBase = this.stockBaseRepository.create(createStockBaseDto);
    return this.stockBaseRepository.save(stockBase);
  }

  async update(code: string, updateStockBaseDto: UpdateStockBaseDto): Promise<StockBase> {
    await this.stockBaseRepository.update(code, updateStockBaseDto);
    return this.findOne(code);
  }

  async remove(code: string): Promise<void> {
    await this.stockBaseRepository.delete(code);
  }
}
