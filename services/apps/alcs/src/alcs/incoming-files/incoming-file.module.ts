import { Module } from '@nestjs/common';
import { IncomingFileController } from './incoming-file.controller';
import { ApplicationModule } from '../application/application.module';
import { PlanningReviewModule } from '../planning-review/planning-review.module';

@Module({
  imports: [ApplicationModule, PlanningReviewModule],
  providers: [],
  controllers: [IncomingFileController],
  exports: [],
})
export class IncomingFileModule {}
