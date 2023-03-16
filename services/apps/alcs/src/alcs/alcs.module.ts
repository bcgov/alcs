import { Module } from '@nestjs/common';
import { AdminModule } from './admin/admin.module';
import { ApplicationGrpcModule } from './application-grpc/application-grpc.module';
import { ApplicationModule } from './application/application.module';
import { BoardModule } from './board/board.module';
import { CommentModule } from './comment/comment.module';
import { CommissionerModule } from './commissioner/commissioner.module';
import { CovenantModule } from './covenant/covenant.module';
import { DecisionModule } from './decision/decision.module';
import { HomeModule } from './home/home.module';
import { ImportModule } from './import/import.module';
import { NotificationModule } from './notification/notification.module';
import { PlanningReviewModule } from './planning-review/planning-review.module';

@Module({
  imports: [
    ApplicationModule,
    ApplicationGrpcModule,
    CommentModule,
    HomeModule,
    NotificationModule,
    BoardModule,
    PlanningReviewModule,
    CovenantModule,
    CommissionerModule,
    ImportModule,
    DecisionModule,
    AdminModule,
  ],
  controllers: [],
  providers: [],
})
export class AlcsModule {}
