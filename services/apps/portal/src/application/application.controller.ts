import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import {
  BadRequestException,
  Controller,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../common/authorization/auth-guard.service';
import { ApplicationDocumentService } from './application-document/application-document.service';
import { ApplicationDto } from './application.dto';
import { Application } from './application.entity';
import { ApplicationService } from './application.service';

@Controller('application')
@UseGuards(AuthGuard)
export class ApplicationController {
  constructor(
    private applicationService: ApplicationService,
    private documentService: ApplicationDocumentService,
    @InjectMapper() private mapper: Mapper,
  ) {}

  @Post()
  async create(@Req() req) {
    if (!req.isMultipart()) {
      throw new BadRequestException('Request is not multipart');
    }
    //TODO: How do we get the fields if there is no file?

    const data = await req.file();
    if (data) {
      const applicantField = data.fields.applicant;
      const localGovernmentField = data.fields.localGovernment;

      const application = await this.applicationService.create({
        applicant: applicantField.value,
        localGovernmentUuid: localGovernmentField.value,
        documents: [],
      });

      await this.documentService.attachDocument(
        application.fileNumber,
        data,
        req.user.entity,
        'certificateOfTitle',
      );

      return this.mapper.map(application, Application, ApplicationDto);
    }
  }
}
