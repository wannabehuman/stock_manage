import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inbound } from './entities/inbound.entity';
import { CreateInboundDto } from './dto/create-inbound.dto';
import { UpdateInboundDto } from './dto/update-inbound.dto';
import { Between } from 'typeorm';
@Injectable()
export class InboundService {
  constructor(
    @InjectRepository(Inbound)
    private readonly inboundRepository: Repository<Inbound>,
  ) {}

  async findAll(): Promise<Inbound[]> {
    return this.inboundRepository.find();
  }
  async findBystock_code(stock_code: string): Promise<Inbound[]> {
    return this.inboundRepository.find({ where: { stock_code } });
  }

  async findByDate(inbound_date: Date): Promise<Inbound[]> {
    return this.inboundRepository.find({ where: { inbound_date } });
  }

  async findOne(stock_code: string, inbound_date: Date): Promise<Inbound> {
    return this.inboundRepository.findOne({ where: { stock_code, inbound_date } });
  }

  async save(inboundDtos: (CreateInboundDto | UpdateInboundDto)[]) {
    const results: any[] = [];

    for (const inboundDto of inboundDtos) {
      const stock_code = inboundDto.stock_code;

      // 날짜 유효성 검사 및 처리
      const date = inboundDto.inbound_date instanceof Date 
        ? inboundDto.inbound_date 
        : new Date(inboundDto.inbound_date);

      if (isNaN(date.getTime())) {
        throw new Error(`올바른 날짜 형식이 아닙니다: ${inboundDto.inbound_date}`);
      }
      const normalizedDate = new Date(date);
      normalizedDate.setHours(0, 0, 0, 0);
      const start = new Date(normalizedDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(normalizedDate);
      end.setHours(23, 59, 59, 999);

      // INSERT일 때도 기존 데이터 확인
      if (inboundDto.rowStatus === 'INSERT') {
        const existingStock = await this.inboundRepository.findOne({
          where: {
            stock_code,
            inbound_date: Between(start, end),
          },
        });
        console.log("INSERT:", existingStock, stock_code, inboundDto.inbound_date);

        if (existingStock) {
          throw new Error(`재고명 "${stock_code}"과 입고일자 "${inboundDto.inbound_date.toISOString().slice(0, 10)}"를 가진 항목이 이미 존재합니다.`);
        }

        const newStock = this.inboundRepository.create({
          stock_code,
          inbound_date: inboundDto.inbound_date,
          quantity: inboundDto.quantity,
          unit: inboundDto.unit,
          max_use_period: inboundDto.max_use_period,
          remark: inboundDto.remark,
        });

        results.push(await this.inboundRepository.insert(newStock));
      } else {
        // UPDATE나 DELETE일 때만 기존 데이터 확인
        const existingStock = await this.inboundRepository.findOne({
          where: {
            stock_code,
            inbound_date: Between(start, end),
          },
        });

        if (inboundDto.rowStatus === 'UPDATE') {
          if (!existingStock) {
            throw new Error(`해당 재고가 존재하지 않습니다.`);
          }

          existingStock.quantity = inboundDto.quantity;
          existingStock.unit = inboundDto.unit;
          existingStock.max_use_period = inboundDto.max_use_period;
          existingStock.remark = inboundDto.remark;

          results.push(await this.inboundRepository.save(existingStock));
        } else if (inboundDto.rowStatus === 'DELETE') {
          if (!existingStock) {
            throw new Error(`해당 재고가 존재하지 않습니다.`);
          }

          await this.inboundRepository.delete({
            stock_code,
            inbound_date: inboundDto.inbound_date,
          });
          results.push(existingStock);
        }
      }
    }

    return results;
  }
}
