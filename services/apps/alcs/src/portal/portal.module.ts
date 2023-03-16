import { ConfigModule } from '@app/common/config/config.module';
import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { AdminModule } from '../alcs/admin/admin.module';
import { ApplicationModule } from '../alcs/application/application.module';
import { BoardModule } from '../alcs/board/board.module';
import { CardModule } from '../alcs/card/card.module';
import { CodeModule } from '../alcs/code/code.module';
import { CommentModule } from '../alcs/comment/comment.module';
import { CommissionerModule } from '../alcs/commissioner/commissioner.module';
import { CovenantModule } from '../alcs/covenant/covenant.module';
import { DecisionModule } from '../alcs/decision/decision.module';
import { HomeModule } from '../alcs/home/home.module';
import { NotificationModule } from '../alcs/notification/notification.module';
import { PlanningReviewModule } from '../alcs/planning-review/planning-review.module';
import { ApplicationProposalModule } from './application-proposal/application-proposal.module';
import { ApplicationProposalReviewModule } from './application-review/application-proposal-review.module';
import { ParcelModule } from './parcel/parcel.module';

@Module({
  imports: [
    ConfigModule,
    ApplicationProposalModule,
    ParcelModule,
    ApplicationProposalReviewModule,
    RouterModule.register([
      { path: 'alcs', module: ApplicationModule },
      { path: 'alcs', module: CommentModule },
      { path: 'alcs', module: NotificationModule },
      { path: 'alcs', module: BoardModule },
      { path: 'alcs', module: CodeModule },
      { path: 'alcs', module: PlanningReviewModule },
      { path: 'alcs', module: CovenantModule },
      { path: 'alcs', module: CommissionerModule },
      { path: 'alcs', module: DecisionModule },
      { path: 'alcs', module: AdminModule },
      { path: 'alcs', module: CardModule },
      { path: 'alcs', module: HomeModule },
    ]),
  ],
  controllers: [],
  providers: [],
})
export class PortalModule {}
