import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import { RolesGuard } from '../../common/authorization/roles-guard.service';
import { ApplicationService } from '../application/application.service';
import { InjectMapper } from 'automapper-nestjs';
import { Mapper } from 'automapper-core';
import { UserRoles } from '../../common/authorization/roles.decorator';
import { ANY_AUTH_ROLE } from '../../common/authorization/roles';
import { IncomingFileBoardMapDto, IncomingFileDto } from './incoming-file.dto';
import { UserDto } from '../../user/user.dto';
import { CARD_TYPE } from '../card/card-type/card-type.entity';
import { User } from '../../user/user.entity';
import { PlanningReviewService } from '../planning-review/planning-review.service';
import { ApplicationTimeTrackingService } from '../application/application-time-tracking.service';

@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@Controller('incoming-files')
@UseGuards(RolesGuard)
export class IncomingFileController {
  constructor(
    private applicationService: ApplicationService,
    private planningReviewService: PlanningReviewService,
    private applicationTimeTrackingService: ApplicationTimeTrackingService,
    @InjectMapper() private mapper: Mapper,
  ) {}

  @Get('')
  @UserRoles(...ANY_AUTH_ROLE)
  async getIncomingFiles(): Promise<IncomingFileBoardMapDto> {
    const mappedApps = await this.getMappedIncomingApplications();
    const mappedReconsiderations =
      await this.getMappedIncomingReconsiderations();
    const mappedPlanningReviews = await this.getMappedIncomingPlanningReviews();

    const boardCodeToFiles: IncomingFileBoardMapDto = {};
    [
      ...mappedApps,
      ...mappedReconsiderations,
      ...mappedPlanningReviews,
    ].forEach((mappedFile) => {
      const boardFiles = boardCodeToFiles[mappedFile.boardCode] || [];
      boardFiles.push(mappedFile);
      boardCodeToFiles[mappedFile.boardCode] = boardFiles;
    });
    return boardCodeToFiles;
  }

  private async getMappedIncomingApplications() {
    const incomingApplications =
      await this.applicationService.getIncomingApplicationFiles();
    const appIds = incomingApplications.map((app) => app.uuid);
    const pausedStatuses =
      await this.applicationTimeTrackingService.getPausedStatusByUuid(appIds);
    return incomingApplications.map((incomingFile): IncomingFileDto => {
      const user = new User();
      user.name = incomingFile.name;
      user.givenName = incomingFile.given_name;
      user.familyName = incomingFile.family_name;
      return {
        fileNumber: incomingFile.file_number,
        applicant: incomingFile.applicant,
        boardCode: incomingFile.code,
        type: CARD_TYPE.APP,
        assignee: incomingFile.name
          ? this.mapper.map(user, User, UserDto)
          : null,
        highPriority: incomingFile.high_priority,
        activeDays: incomingFile.active_days,
        isPaused: pausedStatuses.get(incomingFile.uuid)!,
      };
    });
  }

  private async getMappedIncomingReconsiderations() {
    const incomingReconsiderations =
      await this.applicationService.getIncomingReconsiderationFiles();
    const reconIds = incomingReconsiderations.map((recon) => recon.uuid);
    const pausedStatuses =
      await this.applicationTimeTrackingService.getPausedStatusByUuid(reconIds);
    return incomingReconsiderations.map((incomingFile): IncomingFileDto => {
      const user = new User();
      user.name = incomingFile.name;
      user.givenName = incomingFile.given_name;
      user.familyName = incomingFile.family_name;
      return {
        fileNumber: incomingFile.file_number,
        applicant: incomingFile.applicant,
        boardCode: incomingFile.code,
        type: CARD_TYPE.APP,
        assignee: incomingFile.name
          ? this.mapper.map(user, User, UserDto)
          : null,
        highPriority: incomingFile.high_priority,
        activeDays: incomingFile.active_days,
        isPaused: pausedStatuses.get(incomingFile.uuid)!,
      };
    });
  }

  private async getMappedIncomingPlanningReviews() {
    const incomingPlanningReviews =
      await this.planningReviewService.getIncomingPlanningReviewFiles();
    return incomingPlanningReviews.map((incomingFile): IncomingFileDto => {
      const user = new User();
      user.name = incomingFile.name;
      user.givenName = incomingFile.given_name;
      user.familyName = incomingFile.family_name;
      return {
        fileNumber: incomingFile.file_number,
        applicant: incomingFile.applicant,
        boardCode: incomingFile.code,
        type: CARD_TYPE.PLAN,
        assignee: incomingFile.name
          ? this.mapper.map(user, User, UserDto)
          : null,
        highPriority: incomingFile.high_priority,
        activeDays: incomingFile.active_days,
        isPaused: false,
      };
    });
  }
}
