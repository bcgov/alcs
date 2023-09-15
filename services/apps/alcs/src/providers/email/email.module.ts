import { HttpModule } from '@nestjs/axios';
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentModule } from '../../document/document.module';
import { EmailStatus } from './email-status.entity';
import { EmailService } from './email.service';
import { ApplicationSubmissionModule } from '../../portal/application-submission/application-submission.module';
import { ApplicationModule } from '../../alcs/application/application.module';
import { NoticeOfIntentModule } from '../../alcs/notice-of-intent/notice-of-intent.module';
import { NoticeOfIntentSubmissionModule } from '../../portal/notice-of-intent-submission/notice-of-intent-submission.module';
import { StatusEmailService } from './status-email.service';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([EmailStatus]),
    DocumentModule,
    forwardRef(() => ApplicationModule),
    forwardRef(() => ApplicationSubmissionModule),
    forwardRef(() => NoticeOfIntentModule),
    forwardRef(() => NoticeOfIntentSubmissionModule),
  ],
  providers: [EmailService, StatusEmailService],
  exports: [EmailService, StatusEmailService],
})
export class EmailModule {}
