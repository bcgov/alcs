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
import { RoleGuard } from '../../common/authorization/role.guard';
import { ANY_AUTH_ROLE } from '../../common/authorization/roles';
import { UserRoles } from '../../common/authorization/roles.decorator';
import { UserDto } from '../../user/user.dto';
import { User } from '../../user/user.entity';
import { ApplicationDocumentDto } from '../application-document/application-document.dto';
import { ApplicationDocument } from '../application-document/application-document.entity';
import { ApplicationDocumentService } from '../application-document/application-document.service';
import { ApplicationService } from '../application.service';
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
@UseGuards(RoleGuard)
export class ApplicationDecisionMeetingController {
  constructor(
    private appDecisionMeetingService: ApplicationDecisionMeetingService,
    private applicationService: ApplicationService,
    private appDecDocumentService: ApplicationDocumentService,
    @InjectMapper() private mapper: Mapper,
  ) {}

  @Get('/overview/meetings')
  @UserRoles(...ANY_AUTH_ROLE)
  async getMeetings(): Promise<UpcomingMeetingBoardMapDto> {
    const upcomingApps =
      await this.appDecisionMeetingService.getUpcomingMeetings();
    const allAppIds = upcomingApps.map((a) => a.uuid);
    const allApps = await this.applicationService.getAll({
      uuid: Any(allAppIds),
    });
    const mappedApps = allApps.map((app): UpcomingMeetingDto => {
      const meetingDate = upcomingApps.find(
        (meeting) => meeting.uuid === app.uuid,
      );
      return {
        meetingDate: new Date(meetingDate.next_meeting).getTime(),
        fileNumber: app.fileNumber,
        applicant: app.applicant,
        boardCode: app.card.board.code,
        assignee: this.mapper.map(app.card.assignee, User, UserDto),
      };
    });

    const boardCodeToApps: UpcomingMeetingBoardMapDto = {};
    mappedApps.forEach((mappedApp) => {
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
}
