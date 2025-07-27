import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InboundController } from './inbound.controller';
import { InboundService } from './inbound.service';
import { Inbound } from './entities/inbound.entity';
// import { StockBase } from '../basecode/entities/stock-base.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Inbound])],
  controllers: [InboundController],
  providers: [InboundService],
  exports: [InboundService],
})
export class InboundModule {}
