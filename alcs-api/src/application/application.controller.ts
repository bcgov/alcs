import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApplicationCreateDto, ApplicationDto } from './application.dto';
import { ApplicationService } from './application.service';
import * as config from 'config';

@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@Controller('application')
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  @Get()
  async getAll(): Promise<ApplicationDto[]> {
    const applications = await this.applicationService.getAll();
    return applications.map<ApplicationDto>((app) => {
      return {
        fileNumber: app.fileNumber,
        title: app.title,
        body: app.body,
        status: {
          code: app.status?.code,
          description: app.status?.description,
        },
      };
    });
  }

  @Post()
  async add(
    @Body() application: ApplicationCreateDto,
  ): Promise<ApplicationDto> {
    const app = await this.applicationService.createOrUpdate(application);
    return {
      fileNumber: app.fileNumber,
      title: app.title,
      body: app.body,
      status: {
        code: app.status?.code,
        description: app.status?.description,
      },
    };
  }

  @Patch(':id')
  async update(
    @Body() application: Partial<ApplicationCreateDto>,
    @Param('id') id: string,
  ): Promise<ApplicationDto> {
    const app = await this.applicationService.updateApplication(
      id,
      application,
    );
    return {
      fileNumber: app.fileNumber,
      title: app.title,
      body: app.body,
      status: {
        code: app.status?.code,
        description: app.status?.description,
      },
    };
  }

  @Delete()
  async softDelete(@Body() applicationNumber: string): Promise<void> {
    await this.applicationService.delete(applicationNumber);
  }
}
