import { Body, Controller, Delete, Get, Post } from '@nestjs/common';
import { ApplicationCreateDto, ApplicationDto } from './application.dto';
import { ApplicationService } from './application.service';

@Controller('application')
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  @Get()
  async getAll(): Promise<ApplicationDto[]> {
    const applications = await this.applicationService.getAll();
    return applications.map<ApplicationDto>((app) => {
      return {
        number: app.number,
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
    const app = await this.applicationService.create(application);
    return {
      number: app.number,
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
