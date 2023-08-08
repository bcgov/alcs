import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoardModule } from '../../alcs/board/board.module';
import { LocalGovernmentModule } from '../../alcs/local-government/local-government.module';
import { NoticeOfIntentModule } from '../../alcs/notice-of-intent/notice-of-intent.module';
import { AuthorizationModule } from '../../common/authorization/authorization.module';
import { DocumentModule } from '../../document/document.module';
import { FileNumberModule } from '../../file-number/file-number.module';
import { NoticeOfIntentSubmissionController } from './notice-of-intent-submission.controller';
import { NoticeOfIntentSubmission } from './notice-of-intent-submission.entity';
import { NoticeOfIntentSubmissionService } from './notice-of-intent-submission.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([NoticeOfIntentSubmission]),
    forwardRef(() => NoticeOfIntentModule),
    AuthorizationModule,
    forwardRef(() => DocumentModule),
    forwardRef(() => BoardModule),
    LocalGovernmentModule,
    FileNumberModule,
  ],
  controllers: [NoticeOfIntentSubmissionController],
  providers: [NoticeOfIntentSubmissionService],
})
export class NoticeOfIntentSubmissionModule {}
