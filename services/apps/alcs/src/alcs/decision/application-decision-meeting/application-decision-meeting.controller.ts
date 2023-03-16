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
  UseGuards,
} from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import { Any } from 'typeorm';
import { ApplicationService } from '../../application/application.service';
import { ANY_AUTH_ROLE } from '../../../common/authorization/roles';
import { RolesGuard } from '../../../common/authorization/roles-guard.service';
import { UserRoles } from '../../../common/authorization/roles.decorator';
import { UserDto } from '../../../user/user.dto';
import { User } from '../../../user/user.entity';
import { ApplicationReconsiderationService } from '../application-reconsideration/application-reconsideration.service';
import {
  ApplicationDecisionMeetingDto,
  CreateApplicationDecisionMeetingDto,
  UpcomingMeetingBoardMapDto,
  UpcomingMeetingDto,
} from './application-decision-meeting.dto';
import { ApplicationDecisionMeeting } from './application-decision-meeting.entity';
import { ApplicationDecisionMeetingService } from './application-decision-meeting.service';

@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@Controller('application-decision-meeting')
@UseGuards(RolesGuard)
export class ApplicationDecisionMeetingController {
  constructor(
    private appDecisionMeetingService: ApplicationDecisionMeetingService,
    private applicationService: ApplicationService,
    private reconsiderationService: ApplicationReconsiderationService,
    @InjectMapper() private mapper: Mapper,
  ) {}

  @Get('/overview/meetings')
  @UserRoles(...ANY_AUTH_ROLE)
  async getMeetings(): Promise<UpcomingMeetingBoardMapDto> {
    const mappedApps = await this.getMappedApplicationMeetings();
    const mappedRecons = await this.getMappedReconsiderationMeetings();

    const boardCodeToApps: UpcomingMeetingBoardMapDto = {};
    [...mappedApps, ...mappedRecons].forEach((mappedApp) => {
      const boardMeetings = boardCodeToApps[mappedApp.boardCode] || [];
      boardMeetings.push(mappedApp);
      boardCodeToApps[mappedApp.boardCode] = boardMeetings;
    });

    return boardCodeToApps;
  }

  @Get('/:fileNumber')
  @UserRoles(...ANY_AUTH_ROLE)
  async getAllForApplication(
    @Param('fileNumber') fileNumber,
  ): Promise<ApplicationDecisionMeetingDto[]> {
    const meetings = await this.appDecisionMeetingService.getByAppFileNumber(
      fileNumber,
    );
    return this.mapper.mapArrayAsync(
      meetings,
      ApplicationDecisionMeeting,
      ApplicationDecisionMeetingDto,
    );
  }

  @Get('/meeting/:uuid')
  @UserRoles(...ANY_AUTH_ROLE)
  async get(
    @Param('uuid') uuid: string,
  ): Promise<ApplicationDecisionMeetingDto> {
    const meeting = await this.appDecisionMeetingService.get(uuid);
    return this.mapper.mapAsync(
      meeting,
      ApplicationDecisionMeeting,
      ApplicationDecisionMeetingDto,
    );
  }

  @Delete('/:uuid')
  @UserRoles(...ANY_AUTH_ROLE)
  async delete(@Param('uuid') uuid: string) {
    return this.appDecisionMeetingService.delete(uuid);
  }

  @Post()
  @UserRoles(...ANY_AUTH_ROLE)
  async create(
    @Body() meeting: CreateApplicationDecisionMeetingDto,
  ): Promise<ApplicationDecisionMeetingDto> {
    const application = await this.applicationService.getOrFail(
      meeting.applicationFileNumber,
    );

    const newMeeting = await this.appDecisionMeetingService.createOrUpdate({
      date: new Date(meeting.date),
      applicationUuid: application.uuid,
    });

    return this.mapper.map(
      newMeeting,
      ApplicationDecisionMeeting,
      ApplicationDecisionMeetingDto,
    );
  }

  @Patch()
  @UserRoles(...ANY_AUTH_ROLE)
  async update(
    @Body() appDecMeeting: ApplicationDecisionMeetingDto,
  ): Promise<ApplicationDecisionMeetingDto> {
    const appDecEntity = this.mapper.map(
      appDecMeeting,
      ApplicationDecisionMeetingDto,
      ApplicationDecisionMeeting,
    );
    const updatedMeeting = await this.appDecisionMeetingService.createOrUpdate(
      appDecEntity,
    );
    return this.mapper.map(
      updatedMeeting,
      ApplicationDecisionMeeting,
      ApplicationDecisionMeetingDto,
    );
  }

  private async getMappedApplicationMeetings() {
    const upcomingApplicationMeetings =
      await this.appDecisionMeetingService.getUpcomingApplicationMeetings();
    const allAppIds = upcomingApplicationMeetings.map((a) => a.uuid);
    const allApps = await this.applicationService.getMany({
      uuid: Any(allAppIds),
    });
    return allApps.map((app): UpcomingMeetingDto => {
      const meetingDate = upcomingApplicationMeetings.find(
        (meeting) => meeting.uuid === app.uuid,
      );
      return {
        meetingDate: new Date(meetingDate!.next_meeting).getTime(),
        fileNumber: app.fileNumber,
        applicant: app.applicant,
        boardCode: app.card!.board.code,
        assignee: this.mapper.map(app.card!.assignee, User, UserDto),
      };
    });
  }

  private async getMappedReconsiderationMeetings() {
    const upcomingReconsiderationMeetings =
      await this.appDecisionMeetingService.getUpcomingReconsiderationMeetings();

    const reconIds = upcomingReconsiderationMeetings.map((a) => a.uuid);
    const reconsiderations = await this.reconsiderationService.getMany(
      reconIds,
    );
    return reconsiderations.map((recon): UpcomingMeetingDto => {
      const meetingDate = upcomingReconsiderationMeetings.find(
        (meeting) => meeting.uuid === recon.uuid,
      );
      return {
        meetingDate: new Date(meetingDate!.next_meeting).getTime(),
        fileNumber: recon.application.fileNumber,
        applicant: recon.application.applicant,
        boardCode: recon.card!.board.code,
        assignee: this.mapper.map(recon.card!.assignee, User, UserDto),
      };
    });
  }
}
