import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationModule } from '../application/application.module';
import { CardModule } from '../card/card.module';
import { BoardAutomapperProfile } from '../../common/automapper/board.automapper.profile';
import { CovenantModule } from '../covenant/covenant.module';
import { DecisionModule } from '../decision/decision.module';
import { PlanningReviewModule } from '../planning-review/planning-review.module';
import { BoardStatus } from './board-status.entity';
import { BoardController } from './board.controller';
import { Board } from './board.entity';
import { BoardService } from './board.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Board, BoardStatus]),
    ApplicationModule,
    CardModule,
    forwardRef(() => DecisionModule),
    PlanningReviewModule,
    forwardRef(() => CovenantModule),
  ],
  controllers: [BoardController],
  providers: [BoardService, BoardAutomapperProfile],
  exports: [BoardService],
})
export class BoardModule {}
