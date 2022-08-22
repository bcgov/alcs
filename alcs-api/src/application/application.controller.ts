import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import { RoleGuard } from '../common/authorization/role.guard';
import { ANY_AUTH_ROLE } from '../common/authorization/roles';
import { UserRoles } from '../common/authorization/roles.decorator';
import { ServiceValidationException } from '../common/exceptions/base.exception';
import { NotificationService } from '../notification/notification.service';
import { ApplicationCodeService } from './application-code/application-code.service';
import { ApplicationDecisionMaker } from './application-code/application-decision-maker/application-decision-maker.entity';
import { ApplicationRegion } from './application-code/application-region/application-region.entity';
import { ApplicationType } from './application-code/application-type/application-type.entity';
import { ApplicationStatus } from './application-status/application-status.entity';
import {
  ApplicationDetailedDto,
  ApplicationDto,
  ApplicationUpdateDto,
  CreateApplicationDto,
} from './application.dto';
import { ApplicationService } from './application.service';

@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@Controller('application')
@UseGuards(RoleGuard)
export class ApplicationController {
  constructor(
    private applicationService: ApplicationService,
    private codeService: ApplicationCodeService,
    private notificationService: NotificationService,
    @InjectMapper() private applicationMapper: Mapper,
  ) {}

  @Get()
  @UserRoles(...ANY_AUTH_ROLE)
  async getAll(@Query('dm') dm?: string): Promise<ApplicationDto[]> {
    let decisionMaker;
    if (dm) {
      decisionMaker = await this.codeService.fetchDecisionMaker(dm);
    }
    const applications = await this.applicationService.getAll({
      decisionMaker,
    });
    return this.applicationService.mapToDtos(applications);
  }

  @Get('/:fileNumber')
  @UserRoles(...ANY_AUTH_ROLE)
  async get(@Param('fileNumber') fileNumber): Promise<ApplicationDetailedDto> {
    const application = await this.applicationService.get(fileNumber);
    const mappedApplication = await this.applicationService.mapToDtos([
      application,
    ]);
    return {
      ...mappedApplication[0],
      statusDetails: application.status,
      typeDetails: application.type,
      decisionMakerDetails: application.decisionMaker,
      regionDetails: application.region,
    };
  }

  @Post()
  @UserRoles(...ANY_AUTH_ROLE)
  async create(
    @Body() application: CreateApplicationDto,
  ): Promise<ApplicationDto> {
    const type = await this.codeService.fetchType(application.type);
    const decisionMaker = application.decisionMaker
      ? await this.codeService.fetchDecisionMaker(application.decisionMaker)
      : undefined;

    const region = application.region
      ? await this.codeService.fetchRegion(application.region)
      : undefined;

    const app = await this.applicationService.createOrUpdate({
      ...application,
      type,
      decisionMaker,
      region,
    });
    const mappedApps = await this.applicationService.mapToDtos([app]);
    return mappedApps[0];
  }

  @Patch()
  @UserRoles(...ANY_AUTH_ROLE)
  async update(
    @Body() application: ApplicationUpdateDto,
    @Req() req,
  ): Promise<ApplicationDto> {
    const existingApplication = await this.applicationService.get(
      application.fileNumber,
    );

    if (!existingApplication) {
      throw new ServiceValidationException(
        `File ${application.fileNumber} not found`,
      );
    }

    let status: ApplicationStatus | undefined;
    if (
      application.status &&
      application.status != existingApplication.status.code
    ) {
      status = await this.codeService.fetchStatus(application.status);
    }

    let type: ApplicationType | undefined;
    if (application.type && application.type != existingApplication.type.code) {
      type = await this.codeService.fetchType(application.type);
    }

    let decisionMaker: ApplicationDecisionMaker | undefined;
    if (
      application.decisionMaker &&
      (!existingApplication.decisionMaker ||
        application.decisionMaker != existingApplication.decisionMaker.code)
    ) {
      decisionMaker = await this.codeService.fetchDecisionMaker(
        application.decisionMaker,
      );
    }

    let region: ApplicationRegion | undefined;
    if (
      application.region &&
      (!existingApplication.region ||
        application.region != existingApplication.region.code)
    ) {
      region = await this.codeService.fetchRegion(application.region);
    }

    const app = await this.applicationService.createOrUpdate({
      fileNumber: application.fileNumber,
      applicant: application.applicant,
      statusUuid: status ? status.uuid : undefined,
      typeUuid: type ? type.uuid : undefined,
      decisionMakerUuid: decisionMaker ? decisionMaker.uuid : undefined,
      regionUuid: region ? region.uuid : undefined,
      assigneeUuid: application.assigneeUuid,
      paused: application.paused,
      highPriority: application.highPriority,
    });

    if (app.assigneeUuid !== existingApplication.assigneeUuid) {
      this.notificationService.createForApplication(
        req.user.entity,
        app.assigneeUuid,
        "You've been assigned",
        app,
      );
    }

    const mappedApps = await this.applicationService.mapToDtos([
      app,
    ]);
    return mappedApps[0];
  }

  @Delete()
  @UserRoles(...ANY_AUTH_ROLE)
  async softDelete(@Body() applicationNumber: string): Promise<void> {
    await this.applicationService.delete(applicationNumber);
  }
}
