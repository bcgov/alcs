import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Application } from '../alcs/application/application.entity';
import { NoticeOfIntent } from '../alcs/notice-of-intent/notice-of-intent.entity';
import { PlanningReview } from '../alcs/planning-review/planning-review.entity';
import { FileNumberService } from './file-number.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([PlanningReview, Application, NoticeOfIntent]),
  ],
  providers: [FileNumberService],
  exports: [FileNumberService],
})
export class FileNumberModule {}
