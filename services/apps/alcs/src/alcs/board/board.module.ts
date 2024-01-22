import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoardAutomapperProfile } from '../../common/automapper/board.automapper.profile';
import { ApplicationModule } from '../application/application.module';
import { CardModule } from '../card/card.module';
import { CovenantModule } from '../covenant/covenant.module';
import { ApplicationDecisionModule } from '../application-decision/application-decision.module';
import { NoticeOfIntentDecisionModule } from '../notice-of-intent-decision/notice-of-intent-decision.module';
import { NoticeOfIntentModule } from '../notice-of-intent/notice-of-intent.module';
import { NotificationModule } from '../notification/notification.module';
import { PlanningReviewModule } from '../planning-review/planning-review.module';
import { BoardStatus } from './board-status.entity';
import { BoardController } from './board.controller';
import { Board } from './board.entity';
import { BoardService } from './board.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Board, BoardStatus]),
    forwardRef(() => ApplicationModule),
    CardModule,
    forwardRef(() => ApplicationDecisionModule),
    PlanningReviewModule,
    forwardRef(() => CovenantModule),
    forwardRef(() => NoticeOfIntentModule),
    NoticeOfIntentDecisionModule,
    NotificationModule,
  ],
  controllers: [BoardController],
  providers: [BoardService, BoardAutomapperProfile],
  exports: [BoardService],
})
export class BoardModule {}
