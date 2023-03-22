import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Controller, Get, Param } from '@nestjs/common';
import { Public } from 'nest-keycloak-connect';
import { ApplicationSubmissionService } from './application-submission.service';

// @ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
// @UseGuards(RolesGuard)
@Controller('application-submission')
export class ApplicationSubmissionController {
  constructor(
    private applicationSubmissionService: ApplicationSubmissionService,
    @InjectMapper() private mapper: Mapper,
  ) {}

  @Public()
  @Get('/:fileNumber')
  async get(@Param('fileNUmber') fileNumber: string) {
    const submission = await this.applicationSubmissionService.get(fileNumber);

    return await this.applicationSubmissionService.mapToDto(submission);
  }
}
