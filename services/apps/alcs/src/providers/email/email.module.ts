import { HttpModule } from '@nestjs/axios';
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailStatus } from './email-status.entity';
import { EmailService } from './email.service';
import { ApplicationSubmissionModule } from '../../portal/application-submission/application-submission.module';
import { ApplicationModule } from '../../alcs/application/application.module';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([EmailStatus]),
    forwardRef(() => ApplicationModule),
    forwardRef(() => ApplicationSubmissionModule),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
