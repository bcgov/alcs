import { Body, Controller, Delete, Get, Patch, Post } from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import { ServiceValidationException } from '../common/exceptions/base.exception';
import { ApplicationStatus } from './application-status/application-status.entity';
import { ApplicationStatusService } from './application-status/application-status.service';
import { ApplicationDto, ApplicationPartialDto } from './application.dto';
import { Application } from './application.entity';
import { ApplicationService } from './application.service';
import * as config from 'config';

@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@Controller('application')
export class ApplicationController {
  constructor(
    private readonly applicationService: ApplicationService,
    private applicationStatusService: ApplicationStatusService,
  ) {}

  @Get()
  async getAll(): Promise<ApplicationDto[]> {
    const applications = await this.applicationService.getAll();
    return applications.map<ApplicationDto>((app) => {
      return {
        fileNumber: app.fileNumber,
        title: app.title,
        body: app.body,
        status: app.status.code,
      };
    });
  }

  @Post()
  async add(@Body() application: ApplicationDto): Promise<ApplicationDto> {
    const entity = await this.mapToEntity(application);
    const app = await this.applicationService.createOrUpdate(entity);
    return {
      fileNumber: app.fileNumber,
      title: app.title,
      body: app.body,
      status: app.status.code,
    };
  }

  @Patch()
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
      statusId: status ? status.id : undefined,
    });

    return {
      fileNumber: app.fileNumber,
      title: app.title,
      body: app.body,
      status: app.status.code,
    };
  }

  @Delete()
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
      statusId: status.id,
    };
  }
}
