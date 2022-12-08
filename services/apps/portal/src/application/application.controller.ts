import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../common/authorization/auth-guard.service';
import { ServiceNotFoundException } from '../common/exceptions/base.exception';
import { User } from '../user/user.entity';
import { ApplicationDocumentDto } from './application-document/application-document.dto';
import { ApplicationDocument } from './application-document/application-document.entity';
import { ApplicationDocumentService } from './application-document/application-document.service';
import {
  ApplicationDto,
  ApplicationSubmitToAlcsDto,
  UpdateApplicationDto,
} from './application.dto';
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
  async update(
    @Param('fileId') fileId: string,
    @Body() updateDto: UpdateApplicationDto,
    @Req() req,
  ) {
    //Verify User has Access
    const existingApplication = this.applicationService.getByFileId(
      fileId,
      req.user.entity,
    );

    if (!existingApplication) {
      throw new ServiceNotFoundException(
        'Failed to find application with given File ID and User',
      );
    }

    const application = await this.applicationService.update(fileId, {
      applicant: updateDto.applicant,
      localGovernmentUuid: updateDto.localGovernmentUuid,
    });

    return this.mapper.map(application, Application, ApplicationDto);
  }

  @Post('/:fileId/document')
  async attachDocument(@Req() req, @Param('fileId') fileId: string) {
    //Verify User has Access
    const existingApplication = this.applicationService.getByFileId(
      fileId,
      req.user.entity,
    );

    if (!existingApplication) {
      throw new ServiceNotFoundException(
        'Failed to find application with given File ID and User',
      );
    }

    if (!req.isMultipart()) {
      throw new BadRequestException('Request is not multipart');
    }

    const data = await req.file();
    if (data) {
      const document = await this.documentService.attachDocument(
        fileId,
        data,
        req.user.entity,
        'certificateOfTitle',
      );

      return this.mapper.map(
        document,
        ApplicationDocument,
        ApplicationDocumentDto,
      );
    }
  }

  @Post('/alcs/submit/:fileId')
  async submitToAlcs(
    @Param('fileId') fileId: string,
    @Body() data: ApplicationSubmitToAlcsDto,
    @Req() req,
  ) {
    const existingApplication = this.applicationService.getByFileId(
      fileId,
      req.user.entity,
    );

    if (!existingApplication) {
      throw new ServiceNotFoundException(
        'Failed to find application with given File ID and User',
      );
    }

    return await this.applicationService.submitToAlcs(fileId, data);
  }
}
