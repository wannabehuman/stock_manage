import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OutboundController } from './outbound.controller';
import { OutboundService } from './outbound.service';
import { Outbound } from './entities/outbound.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Outbound])],
  controllers: [OutboundController],
  providers: [OutboundService],
  exports: [OutboundService],
})
export class OutboundModule {}
