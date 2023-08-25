import { HttpModule } from '@nestjs/axios';
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailStatus } from './email-status.entity';
import { EmailService } from './email.service';
import { ApplicationSubmissionModule } from '../../portal/application-submission/application-submission.module';
import { ApplicationModule } from '../../alcs/application/application.module';
import { NoticeOfIntentModule } from '../../alcs/notice-of-intent/notice-of-intent.module';
import { NoticeOfIntentSubmissionModule } from '../../portal/notice-of-intent-submission/notice-of-intent-submission.module';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([EmailStatus]),
    forwardRef(() => ApplicationModule),
    forwardRef(() => ApplicationSubmissionModule),
    forwardRef(() => NoticeOfIntentModule),
    forwardRef(() => NoticeOfIntentSubmissionModule),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
