import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OutboundController } from './outbound.controller';
import { OutboundService } from './outbound.service';
import { Outbound } from './entities/outbound.entity';
import { Inbound } from '../inbound/entities/inbound.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Outbound, Inbound])],
  controllers: [OutboundController],
  providers: [OutboundService],
  exports: [OutboundService],
})
export class OutboundModule {}
