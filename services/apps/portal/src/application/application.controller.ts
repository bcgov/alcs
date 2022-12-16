import { ServiceNotFoundException } from '@app/common/exceptions/base.exception';
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
import { LocalGovernmentService } from '../alcs/local-government/local-government.service';
import { AuthGuard } from '../common/authorization/auth-guard.service';
import { User } from '../user/user.entity';
import { ApplicationDocumentDto } from './application-document/application-document.dto';
import { ApplicationDocument } from './application-document/application-document.entity';
import { ApplicationDocumentService } from './application-document/application-document.service';
import {
  ApplicationSubmitToAlcsDto,
  CreateApplicationDto,
  UpdateApplicationDto,
} from './application.dto';
import { ApplicationService } from './application.service';

@Controller('application')
@UseGuards(AuthGuard)
export class ApplicationController {
  constructor(
    private applicationService: ApplicationService,
    private documentService: ApplicationDocumentService,
    private localGovernmentService: LocalGovernmentService,
    @InjectMapper() private mapper: Mapper,
  ) {}

  @Get()
  async getApplications(@Req() req) {
    const user = req.user.entity as User;

    if (user.bceidBusinessGuid) {
      const localGovernments = await this.localGovernmentService.get();
      const matchingGovernment = localGovernments.find(
        (lg) => lg.bceidBusinessGuid === user.bceidBusinessGuid,
      );
      if (matchingGovernment) {
        const applications =
          await this.applicationService.getByBceidBusinessGuid(
            user.bceidBusinessGuid,
          );
        return this.applicationService.mapToDTOs(applications);
      }
    }

    const applications = await this.applicationService.getByUser(user);
    return this.applicationService.mapToDTOs(applications);
  }

  @Get('/:fileId')
  async getApplication(@Req() req, @Param('fileId') fileId: string) {
    const user = req.user.entity as User;
    const application = await this.applicationService.getByFileId(fileId, user);

    if (!application) {
      throw new ServiceNotFoundException(
        `Failed to load application with File ID ${fileId}`,
      );
    }

    const mappedApps = await this.applicationService.mapToDTOs([application]);
    return mappedApps[0];
  }

  @Post()
  async create(@Req() req, @Body() body: CreateApplicationDto) {
    const { type } = body;
    const user = req.user.entity as User;
    const newFileNumber = await this.applicationService.create(type, user);
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
    const existingApplication = await this.applicationService.getByFileId(
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

    const mappedApps = await this.applicationService.mapToDTOs([application]);
    return mappedApps[0];
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

      return this.mapper.mapAsync(
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
    const existingApplication = await this.applicationService.getByFileId(
      fileId,
      req.user.entity,
    );

    if (!existingApplication) {
      throw new ServiceNotFoundException(
        `Failed to find application with given File ID ${fileId} and User`,
      );
    }

    return await this.applicationService.submitToAlcs(fileId, data);
  }
}
