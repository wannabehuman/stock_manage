import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Outbound } from './entities/outbound.entity';
import { CreateOutboundDto } from './dto/create-outbound.dto';
import { UpdateOutboundDto } from './dto/update-outbound.dto';
import { Inbound } from '../inbound/entities/inbound.entity';

@Injectable()
export class OutboundService {
  constructor(
    @InjectRepository(Outbound)
    private readonly outboundRepository: Repository<Outbound>,
    @InjectRepository(Inbound)
    private readonly inboundRepository: Repository<Inbound>,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(): Promise<Outbound[]> {
    return this.outboundRepository.find({
      order: { createdAt: 'DESC' }
    });
  }

  async findByStock(stock_code: string): Promise<Outbound[]> {
    return this.outboundRepository.find({ 
      where: { stock_code },
      order: { createdAt: 'DESC' }
    });
  }

  async findByDate(outboundDate: Date): Promise<Outbound[]> {
    return this.outboundRepository.find({ 
      where: { outboundDate },
      order: { createdAt: 'DESC' }
    });
  }

  async findOne(id: number): Promise<Outbound | null> {
    return this.outboundRepository.findOne({
      where: { id },
    });
  }

  async save(outboundDtos: (CreateOutboundDto | UpdateOutboundDto)[]) {
    const results: any[] = [];

    // 트랜잭션 시작
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const outboundDto of outboundDtos) {
        // 날짜 유효성 검사 및 처리
        const outboundDate = outboundDto.outboundDate instanceof Date 
          ? outboundDto.outboundDate 
          : new Date(outboundDto.outboundDate);

        if (isNaN(outboundDate.getTime())) {
          throw new Error(`올바른 날짜 형식이 아닙니다: ${outboundDto.outboundDate}`);
        }

        if (outboundDto.rowStatus === 'INSERT') {
          // 입고 데이터 조회
          const inbound = await queryRunner.manager.findOne(Inbound, {
            where: { 
              stock_code: outboundDto.stock_code,
              inbound_date: outboundDto.inbound_date
            }
          });

          if (!inbound) {
            throw new Error(`해당 입고 데이터를 찾을 수 없습니다. (재고코드: ${outboundDto.stock_code})`);
          }

          // 재고 부족 검사
          if (inbound.quantity < outboundDto.quantity) {
            throw new Error(`재고 부족: 현재 재고 ${inbound.quantity}${inbound.unit}, 출고 요청 ${outboundDto.quantity}${outboundDto.unit}`);
          }

          // 입고 수량에서 출고 수량 차감
          inbound.quantity -= outboundDto.quantity;
          await queryRunner.manager.save(Inbound, inbound);

          // 출고 데이터 생성
          const newOutbound = queryRunner.manager.create(Outbound, {
            stock_code: outboundDto.stock_code,
            inbound_date: outboundDto.inbound_date,
            outboundDate: outboundDate,
            quantity: outboundDto.quantity,
            unit: outboundDto.unit,
            remark: outboundDto.remark,
            status: 'COMPLETED' // 출고 등록 시 바로 완료 처리
          });

          results.push(await queryRunner.manager.save(Outbound, newOutbound));

        } else if (outboundDto.rowStatus === 'UPDATE') {
          const id = (outboundDto as any).id;
          if (!id) {
            throw new Error('수정할 출고 데이터의 ID가 필요합니다.');
          }

          const existingOutbound = await queryRunner.manager.findOne(Outbound, {
            where: { id }
          });
          
          if (!existingOutbound) {
            throw new Error(`해당 출고 데이터가 존재하지 않습니다.`);
          }

          // 출고 완료된 데이터는 수정 불가
          if (existingOutbound.status === 'COMPLETED') {
            throw new Error('출고 완료된 데이터는 수정할 수 없습니다.');
          }

          // 기존 출고 수량을 입고에 다시 추가
          const oldInbound = await queryRunner.manager.findOne(Inbound, {
            where: { 
              stock_code: existingOutbound.stock_code,
              inbound_date: existingOutbound.inbound_date
            }
          });

          if (oldInbound) {
            oldInbound.quantity += existingOutbound.quantity;
            await queryRunner.manager.save(Inbound, oldInbound);
          }

          // 새로운 입고 데이터에서 출고 수량 차감
          const newInbound = await queryRunner.manager.findOne(Inbound, {
            where: { 
              stock_code: outboundDto.stock_code,
              inbound_date: outboundDto.inbound_date
            }
          });

          if (!newInbound) {
            throw new Error(`해당 입고 데이터를 찾을 수 없습니다.`);
          }

          if (newInbound.quantity < outboundDto.quantity) {
            throw new Error(`재고 부족: 현재 재고 ${newInbound.quantity}${newInbound.unit}, 출고 요청 ${outboundDto.quantity}${outboundDto.unit}`);
          }

          newInbound.quantity -= outboundDto.quantity;
          await queryRunner.manager.save(Inbound, newInbound);

          // 출고 데이터 업데이트
          existingOutbound.stock_code = outboundDto.stock_code;
          existingOutbound.inbound_date = outboundDto.inbound_date;
          existingOutbound.outboundDate = outboundDate;
          existingOutbound.quantity = outboundDto.quantity;
          existingOutbound.unit = outboundDto.unit;
          existingOutbound.remark = outboundDto.remark;
          existingOutbound.status = 'COMPLETED'; // 수정 시에도 완료 처리

          results.push(await queryRunner.manager.save(Outbound, existingOutbound));

        } else if (outboundDto.rowStatus === 'DELETE') {
          const id = (outboundDto as any).id;
          if (!id) {
            throw new Error('삭제할 출고 데이터의 ID가 필요합니다.');
          }

          const existingOutbound = await queryRunner.manager.findOne(Outbound, {
            where: { id }
          });
          
          if (!existingOutbound) {
            throw new Error(`해당 출고 데이터가 존재하지 않습니다.`);
          }

          // 출고 완료된 데이터는 삭제 불가
          if (existingOutbound.status === 'COMPLETED') {
            throw new Error('출고 완료된 데이터는 삭제할 수 없습니다.');
          }

          // 출고 수량을 입고에 다시 추가 (취소)
          const inbound = await queryRunner.manager.findOne(Inbound, {
            where: { 
              stock_code: existingOutbound.stock_code,
              inbound_date: existingOutbound.inbound_date
            }
          });

          if (inbound) {
            inbound.quantity += existingOutbound.quantity;
            await queryRunner.manager.save(Inbound, inbound);
          }

          await queryRunner.manager.delete(Outbound, id);
          results.push(existingOutbound);
        }
      }

      await queryRunner.commitTransaction();
      return results;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async create(createOutboundDto: CreateOutboundDto): Promise<Outbound> {
    const outbound = this.outboundRepository.create({
      ...createOutboundDto,
    });

    return this.outboundRepository.save(outbound);
  }

  async update(id: number, updateOutboundDto: UpdateOutboundDto): Promise<Outbound> {
    await this.outboundRepository.update(id, updateOutboundDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.outboundRepository.delete(id);
  }

  async completeOutbound(id: number): Promise<Outbound> {
    const outbound = await this.findOne(id);
    if (!outbound) {
      throw new Error('해당 출고 데이터를 찾을 수 없습니다.');
    }

    if (outbound.status === 'COMPLETED') {
      throw new Error('이미 완료된 출고 데이터입니다.');
    }

    // 입고 재고 확인
    const inbound = await this.inboundRepository.findOne({
      where: { 
        stock_code: outbound.stock_code,
        inbound_date: outbound.inbound_date
      }
    });

    if (!inbound) {
      throw new Error('해당 입고 데이터를 찾을 수 없습니다.');
    }

    // 재고가 0이면 완료 처리하고 수정 불가
    outbound.status = 'COMPLETED';
    return this.outboundRepository.save(outbound);
  }
}
