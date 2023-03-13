import { Module } from '@nestjs/common';
import { CommonService } from './common.service';
import { EmailTemplateServiceService } from './email-template-service/email-template-service.service';

@Module({
  providers: [CommonService, EmailTemplateServiceService],
  exports: [CommonService, EmailTemplateServiceService],
})
export class CommonModule {}
