import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CodeModule } from '../code/code.module';
import { CardProfile } from '../../common/automapper/card.automapper.profile';
import { MessageModule } from '../message/message.module';
import { CardHistory } from './card-history/card-history.entity';
import { CardSubscriber } from './card-history/card.subscriber';
import { CardStatus } from './card-status/card-status.entity';
import { CardStatusService } from './card-status/card-status.service';
import { CardSubtaskType } from './card-subtask/card-subtask-type/card-subtask-type.entity';
import { CardSubtaskController } from './card-subtask/card-subtask.controller';
import { CardSubtask } from './card-subtask/card-subtask.entity';
import { CardSubtaskService } from './card-subtask/card-subtask.service';
import { CardType } from './card-type/card-type.entity';
import { CardController } from './card.controller';
import { Card } from './card.entity';
import { CardService } from './card.service';
import { ApplicationDecisionCondition } from '../application-decision/application-decision-condition/application-decision-condition.entity';
import { ApplicationDecisionModule } from '../application-decision/application-decision.module';
import { NoticeOfIntentDecisionModule } from '../notice-of-intent-decision/notice-of-intent-decision.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Card,
      CardStatus,
      CardType,
      CardSubtaskType,
      CardSubtask,
      CardHistory,
      ApplicationDecisionCondition,
    ]),
    CodeModule,
    MessageModule,
    forwardRef(() => ApplicationDecisionModule),
    forwardRef(() => NoticeOfIntentDecisionModule),
  ],
  controllers: [CardSubtaskController, CardController],
  providers: [CardStatusService, CardService, CardSubtaskService, CardSubscriber, CardProfile],
  exports: [CardStatusService, CardService, CardSubtaskService],
})
export class CardModule {}
