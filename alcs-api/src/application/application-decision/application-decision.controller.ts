import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import { RoleGuard } from '../../common/authorization/role.guard';
import { ANY_AUTH_ROLE } from '../../common/authorization/roles';
import { UserRoles } from '../../common/authorization/roles.decorator';
import { ApplicationService } from '../application.service';
import {
  ApplicationDecisionDto,
  CreateApplicationDecisionDto,
  DecisionDocumentDto,
  UpdateApplicationDecisionDto,
} from './application-decision.dto';
import { ApplicationDecision } from './application-decision.entity';
import { ApplicationDecisionService } from './application-decision.service';
import { DecisionDocument } from './decision-document.entity';

@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@Controller('application-decision')
@UseGuards(RoleGuard)
export class ApplicationDecisionController {
  constructor(
    private appDecisionService: ApplicationDecisionService,
    private applicationService: ApplicationService,
    @InjectMapper() private mapper: Mapper,
  ) {}

  @Get('/application/:fileNumber')
  @UserRoles(...ANY_AUTH_ROLE)
  async getAllForApplication(
    @Param('fileNumber') fileNumber,
  ): Promise<ApplicationDecisionDto[]> {
    const decisions = await this.appDecisionService.getByAppFileNumber(
      fileNumber,
    );
    return this.mapper.mapArrayAsync(
      decisions,
      ApplicationDecision,
      ApplicationDecisionDto,
    );
  }

  @Get('/:uuid')
  @UserRoles(...ANY_AUTH_ROLE)
  async get(@Param('uuid') uuid: string): Promise<ApplicationDecisionDto> {
    const meeting = await this.appDecisionService.get(uuid);
    return this.mapper.mapAsync(
      meeting,
      ApplicationDecision,
      ApplicationDecisionDto,
    );
  }

  @Post()
  @UserRoles(...ANY_AUTH_ROLE)
  async create(
    @Body() meeting: CreateApplicationDecisionDto,
  ): Promise<ApplicationDecisionDto> {
    const application = await this.applicationService.get(
      meeting.applicationFileNumber,
    );

    if (!application) {
      throw new NotFoundException(
        `Application not found ${meeting.applicationFileNumber}`,
      );
    }

    const newDecision = await this.appDecisionService.create(
      meeting,
      application,
    );

    return this.mapper.map(
      newDecision,
      ApplicationDecision,
      ApplicationDecisionDto,
    );
  }

  @Patch('/:uuid')
  @UserRoles(...ANY_AUTH_ROLE)
  async update(
    @Param('uuid') uuid: string,
    @Body() appDecMeeting: UpdateApplicationDecisionDto,
  ): Promise<ApplicationDecisionDto> {
    const updatedMeeting = await this.appDecisionService.update(
      uuid,
      appDecMeeting,
    );
    return this.mapper.map(
      updatedMeeting,
      ApplicationDecision,
      ApplicationDecisionDto,
    );
  }

  @Delete('/:uuid')
  @UserRoles(...ANY_AUTH_ROLE)
  async delete(@Param('uuid') uuid: string) {
    return this.appDecisionService.delete(uuid);
  }

  @Post('/:uuid/file')
  @UserRoles(...ANY_AUTH_ROLE)
  async attachDocument(
    @Param('uuid') decisionUuid: string,
    @Param('documentType') documentType: string,
    @Req() req,
  ): Promise<DecisionDocumentDto> {
    if (!req.isMultipart()) {
      throw new BadRequestException('Request is not multipart');
    }

    const file = await req.file();
    const savedDocument = await this.appDecisionService.attachDocument(
      decisionUuid,
      file,
      req.user.entity,
    );
    return this.mapper.map(
      savedDocument,
      DecisionDocument,
      DecisionDocumentDto,
    );
  }

  @Get('/:uuid/file/:fileUuid/download')
  @UserRoles(...ANY_AUTH_ROLE)
  async getDownloadUrl(
    @Param('uuid') decisionUuid: string,
    @Param('fileUuid') documentUuid: string,
  ) {
    const downloadUrl = await this.appDecisionService.getDownloadUrl(
      documentUuid,
    );
    return {
      url: downloadUrl,
    };
  }

  @Get('/:uuid/file/:fileUuid/open')
  @UserRoles(...ANY_AUTH_ROLE)
  async getOpenUrl(
    @Param('uuid') decisionUuid: string,
    @Param('fileUuid') documentUuid: string,
  ) {
    const downloadUrl = await this.appDecisionService.getDownloadUrl(
      documentUuid,
      true,
    );
    return {
      url: downloadUrl,
    };
  }

  @Delete('/:uuid/file/:fileUuid')
  @UserRoles(...ANY_AUTH_ROLE)
  async deleteDocument(
    @Param('uuid') decisionUuid: string,
    @Param('fileUuid') documentUuid: string,
  ): Promise<DecisionDocumentDto> {
    const savedDocument = await this.appDecisionService.deleteDocument(
      documentUuid,
    );
    return this.mapper.map(
      savedDocument,
      DecisionDocument,
      DecisionDocumentDto,
    );
  }
}
