import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../common/authorization/auth-guard.service';
import { User } from '../user/user.entity';
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

  @Get()
  async getApplications(@Req() req) {
    const user = req.user.entity as User;
    const applications = await this.applicationService.getByUser(user);
    return this.mapper.mapArray(applications, Application, ApplicationDto);
  }

  @Get('/:fileId')
  async getApplication(@Req() req, @Param('fileId') fileId: string) {
    const user = req.user.entity as User;
    const application = await this.applicationService.getByFileId(fileId, user);
    return this.mapper.map(application, Application, ApplicationDto);
  }

  @Post()
  async create(@Req() req) {
    const user = req.user.entity as User;
    const newFileNumber = await this.applicationService.create(user);
    return {
      fileId: newFileNumber,
    };
  }

  @Post('/:fileId')
  async update(@Req() req, @Param('fileId') fileId: string) {
    //Verify User has Access
    const existingApplication = this.applicationService.getByFileId(
      fileId,
      req.user.entity,
    );

    //TODO: How do we get the fields if there is no file?
    if (!existingApplication) {
      throw new Error('Failed to find application with given File ID and User');
    }

    if (!req.isMultipart()) {
      throw new BadRequestException('Request is not multipart');
    }

    const data = await req.file();
    if (data) {
      const applicantField = data.fields.applicant;
      const localGovernmentField = data.fields.localGovernment;

      const application = await this.applicationService.update(fileId, {
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
