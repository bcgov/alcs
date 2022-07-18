import { Body, Controller, Delete, Get, Post } from '@nestjs/common';
import { ApplicationStatusDto } from './application-status.dto';
import { ApplicationStatusService } from './application-status.service';

@Controller('application-status')
export class ApplicationStatusController {
  constructor(
    private readonly applicationStatusService: ApplicationStatusService,
  ) {}

  @Get()
  async getAll(): Promise<ApplicationStatusDto[]> {
    const applications = await this.applicationStatusService.getAll();
    return applications.map<ApplicationStatusDto>((app) => {
      return { code: app.code, description: app.description };
    });
  }

  @Post()
  async add(
    @Body() application: ApplicationStatusDto,
  ): Promise<ApplicationStatusDto> {
    const app = await this.applicationStatusService.create(application);
    return {
      code: app.code,
      description: app.description,
    };
  }

  @Delete()
  async softDelete(@Body() applicationStatusCode: string): Promise<void> {
    await this.applicationStatusService.delete(applicationStatusCode);
  }
}
