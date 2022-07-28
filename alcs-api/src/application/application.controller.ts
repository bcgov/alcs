import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import { RoleGuard } from '../common/authorization/role.guard';
import { UserRoles } from '../common/authorization/roles.decorator';
import { ANY_AUTH_ROLE } from '../common/enum';
import { ServiceValidationException } from '../common/exceptions/base.exception';
import { ApplicationStatus } from './application-status/application-status.entity';
import { ApplicationStatusService } from './application-status/application-status.service';
import { ApplicationTimeTrackingService } from './application-time-tracking.service';
import {
  ApplicationDetailedDto,
  ApplicationDto,
  ApplicationPartialDto,
} from './application.dto';
import { Application } from './application.entity';
import { ApplicationService } from './application.service';

@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@Controller('application')
@UseGuards(RoleGuard)
export class ApplicationController {
  constructor(
    private applicationService: ApplicationService,
    private applicationStatusService: ApplicationStatusService,
    private applicationPausedService: ApplicationTimeTrackingService,
  ) {}

  @Get()
  @UserRoles(...ANY_AUTH_ROLE)
  async getAll(): Promise<ApplicationDto[]> {
    const applications = await this.applicationService.getAll();
    return this.mapApplicationsToDtos(applications);
  }

  @Get('/:fileNumber')
  @UserRoles(...ANY_AUTH_ROLE)
  async get(@Param('fileNumber') fileNumber): Promise<ApplicationDetailedDto> {
    const application = await this.applicationService.get(fileNumber);
    const mappedApplication = await this.mapApplicationsToDtos([application]);
    return {
      ...mappedApplication[0],
      statusDetails: application.status,
    };
  }

  @Post()
  @UserRoles(...ANY_AUTH_ROLE)
  async add(@Body() application: ApplicationDto): Promise<ApplicationDto> {
    const entity = await this.mapToEntity(application);
    const app = await this.applicationService.createOrUpdate(entity);
    const mappedApps = await this.mapApplicationsToDtos([app]);
    return mappedApps[0];
  }

  @Patch()
  @UserRoles(...ANY_AUTH_ROLE)
  async update(
    @Body() application: ApplicationPartialDto,
  ): Promise<ApplicationDto> {
    const existingApplication = await this.applicationService.get(
      application.fileNumber,
    );

    if (!existingApplication) {
      throw new ServiceValidationException('File not found');
    }

    let status: ApplicationStatus | undefined;
    if (
      application.status &&
      application.status != existingApplication.status.code
    ) {
      status = await this.applicationStatusService.fetchStatus(
        application.status,
      );
    }

    const app = await this.applicationService.createOrUpdate({
      fileNumber: application.fileNumber,
      title: application.title,
      body: application.body,
      statusUuid: status ? status.uuid : undefined,
      assigneeUuid: application.assigneeUuid,
      paused: application.paused,
    });

    const mappedApps = await this.mapApplicationsToDtos([app]);
    return mappedApps[0];
  }

  @Delete()
  @UserRoles(...ANY_AUTH_ROLE)
  async softDelete(@Body() applicationNumber: string): Promise<void> {
    await this.applicationService.delete(applicationNumber);
  }

  private async mapToEntity(
    application: ApplicationDto,
  ): Promise<Partial<Application>> {
    const status = await this.applicationStatusService.fetchStatus(
      application.status,
    );

    return {
      fileNumber: application.fileNumber,
      title: application.title,
      body: application.body,
      statusUuid: status.uuid,
    };
  }

  private async mapApplicationsToDtos(applications: Application[]) {
    const appTimeMap =
      await this.applicationPausedService.fetchApplicationActiveTimes(
        applications,
      );

    return applications.map((app) => ({
      fileNumber: app.fileNumber,
      title: app.title,
      body: app.body,
      status: app.status.code,
      assigneeUuid: app.assigneeUuid,
      assignee: app.assignee,
      paused: app.paused,
      activeDays: appTimeMap.get(app.uuid).activeDays || 0,
      pausedDays: appTimeMap.get(app.uuid).pausedDays || 0,
    }));
  }
}
