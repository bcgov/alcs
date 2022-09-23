import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CardHistory } from './card-history/card-history.entity';
import { CardSubscriber } from './card-history/card.subscriber';
import { CardStatusController } from './card-status/card-status.controller';
import { CardStatus } from './card-status/card-status.entity';
import { CardStatusService } from './card-status/card-status.service';
import { CardSubtaskType } from './card-subtask/card-subtask-type/card-subtask-type.entity';
import { CardSubtask } from './card-subtask/card-subtask.entity';
import { CardSubtaskService } from './card-subtask/card-subtask.service';
import { CardType } from './card-type/card-type.entity';
import { Card } from './card.entity';
import { CardService } from './card.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Card,
      CardStatus,
      CardType,
      CardSubtaskType,
      CardSubtask,
      CardHistory,
    ]),
  ],
  controllers: [CardStatusController],
  providers: [
    CardStatusService,
    CardService,
    CardSubtaskService,
    CardSubscriber,
  ],
  exports: [CardStatusService, CardService, CardSubtaskService],
})
export class CardModule {}
