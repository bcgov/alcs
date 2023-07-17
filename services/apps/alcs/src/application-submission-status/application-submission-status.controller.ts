import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Controller, Get, Param } from '@nestjs/common';
import { ANY_AUTH_ROLE } from '../common/authorization/roles';
import { UserRoles } from '../common/authorization/roles.decorator';
import { ApplicationSubmissionStatusService } from './application-submission-status.service';
import { ApplicationSubmissionToSubmissionStatusDto } from './submission-status.dto';
import { ApplicationSubmissionToSubmissionStatus } from './submission-status.entity';

@Controller('application-submission-status')
@UserRoles(...ANY_AUTH_ROLE)
export class ApplicationSubmissionStatusController {
  constructor(
    private applicationSubmissionStatusService: ApplicationSubmissionStatusService,
    @InjectMapper() private mapper: Mapper,
  ) {}

  @Get('/:fileNumber')
  async getStatusesByFileNumber(@Param('fileNumber') fileNumber) {
    const statuses =
      await this.applicationSubmissionStatusService.getCurrentStatusesByFileNumber(
        fileNumber,
      );

    return this.mapper.mapArrayAsync(
      statuses,
      ApplicationSubmissionToSubmissionStatus,
      ApplicationSubmissionToSubmissionStatusDto,
    );
  }
}
