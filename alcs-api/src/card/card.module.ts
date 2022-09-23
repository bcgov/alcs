import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CardStatusController } from './card-status/card-status.controller';
import { CardStatus } from './card-status/card-status.entity';
import { CardStatusService } from './card-status/card-status.service';
import { CardType } from './card-type/card-type.entity';
import { Card } from './card.entity';
import { CardService } from './card.service';

@Module({
  imports: [TypeOrmModule.forFeature([Card, CardStatus, CardType])],
  controllers: [CardStatusController],
  providers: [CardStatusService, CardService],
  exports: [CardStatusService, CardService],
})
export class CardModule {}
