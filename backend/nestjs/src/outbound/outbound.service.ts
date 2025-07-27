import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Outbound } from './entities/outbound.entity';
import { CreateOutboundDto } from './dto/create-outbound.dto';
import { UpdateOutboundDto } from './dto/update-outbound.dto';
// import { Inbound } from '../inbound/entities/inbound.entity';

@Injectable()
export class OutboundService {
  constructor(
    @InjectRepository(Outbound)
    private outboundRepository: Repository<Outbound>,
    // @InjectRepository(Inbound)
    // private inboundRepository: Repository<Inbound>,
  ) {}

  async findAll(): Promise<Outbound[]> {
    return this.outboundRepository.find();
  }

  async findByInbound(stock_code: string): Promise<Outbound[]> {
    return this.outboundRepository.find({
      where: { stock_code },
    });
  }

  async findByDate(outboundDate: Date): Promise<Outbound[]> {
    return this.outboundRepository.find({
      where: { outboundDate },
    });
  }

  async create(createOutboundDto: CreateOutboundDto): Promise<Outbound> {
    // const inbound = await this.inboundRepository.findOne({
    //   where: { stock_code: createOutboundDto.stock_code, inbound_date: createOutboundDto.inbound_date }
    // });

    // if (!inbound) {
    //   throw new Error('입고 정보를 찾을 수 없습니다.');
    // }

    const outbound = this.outboundRepository.create({
      ...createOutboundDto,
    });

    return this.outboundRepository.save(outbound);
  }

  async update(id: number, updateOutboundDto: UpdateOutboundDto): Promise<Outbound> {
    await this.outboundRepository.update(id, updateOutboundDto);
    return this.findOne(id);
  }

  async findOne(id: number): Promise<Outbound | null> {
    return this.outboundRepository.findOne({
      where: { id },
    });
  }

  async remove(id: number): Promise<void> {
    await this.outboundRepository.delete(id);
  }
}
