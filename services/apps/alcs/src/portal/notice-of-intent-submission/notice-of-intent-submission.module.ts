import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoardModule } from '../../alcs/board/board.module';
import { LocalGovernmentModule } from '../../alcs/local-government/local-government.module';
import { NoticeOfIntentSubmissionStatusModule } from '../../alcs/notice-of-intent/notice-of-intent-submission-status/notice-of-intent-submission-status.module';
import { NoticeOfIntentModule } from '../../alcs/notice-of-intent/notice-of-intent.module';
import { AuthorizationModule } from '../../common/authorization/authorization.module';
import { NoticeOfIntentSubmissionProfile } from '../../common/automapper/notice-of-intent-submission.automapper.profile';
import { DocumentModule } from '../../document/document.module';
import { FileNumberModule } from '../../file-number/file-number.module';
import { NoticeOfIntentSubmissionController } from './notice-of-intent-submission.controller';
import { NoticeOfIntentSubmission } from './notice-of-intent-submission.entity';
import { NoticeOfIntentSubmissionService } from './notice-of-intent-submission.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([NoticeOfIntentSubmission]),
    NoticeOfIntentSubmissionStatusModule,
    forwardRef(() => NoticeOfIntentModule),
    AuthorizationModule,
    forwardRef(() => DocumentModule),
    forwardRef(() => BoardModule),
    LocalGovernmentModule,
    FileNumberModule,
  ],
  controllers: [NoticeOfIntentSubmissionController],
  providers: [NoticeOfIntentSubmissionService, NoticeOfIntentSubmissionProfile],
})
export class NoticeOfIntentSubmissionModule {}
