import { Module } from '@nestjs/common';
import { CommonService } from './common.service';
import { EmailTemplateService } from './email-template-service/email-template.service';

@Module({
  providers: [CommonService, EmailTemplateService],
  exports: [CommonService, EmailTemplateService],
})
export class CommonModule {}
