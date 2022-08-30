import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import { RoleGuard } from '../../common/authorization/role.guard';
import { ANY_AUTH_ROLE } from '../../common/authorization/roles';
import { UserRoles } from '../../common/authorization/roles.decorator';
import { ApplicationCodeService } from '../application-code/application-code.service';
import { ApplicationService } from '../application.service';
import {
  ApplicationMeetingDto,
  CreateApplicationMeetingDto,
} from './application-meeting.dto';
import { ApplicationMeeting } from './application-meeting.entity';
import { ApplicationMeetingService } from './application-meeting.service';

@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@Controller('application-meeting')
@UseGuards(RoleGuard)
export class ApplicationMeetingController {
  constructor(
    private appDecisionMeetingService: ApplicationMeetingService,
    private applicationService: ApplicationService,
    private applicationCodeService: ApplicationCodeService,
    @InjectMapper() private mapper: Mapper,
  ) {}

  @Get(':fileNumber')
  @UserRoles(...ANY_AUTH_ROLE)
  async getAllForApplication(
    @Param('meetingType') meetingTypeCode,
    @Param('fileNumber') fileNumber,
  ): Promise<ApplicationMeetingDto[]> {
    const meetings = await this.appDecisionMeetingService.getByAppFileNumber(
      fileNumber,
    );

    return this.mapper.mapArrayAsync(
      meetings,
      ApplicationMeeting,
      ApplicationMeetingDto,
    );
  }

  @Get('/meeting/:uuid')
  @UserRoles(...ANY_AUTH_ROLE)
  async get(@Param('uuid') uuid: string): Promise<ApplicationMeetingDto> {
    const meeting = await this.appDecisionMeetingService.get(uuid);
    return this.mapper.mapAsync(
      meeting,
      ApplicationMeeting,
      ApplicationMeetingDto,
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
    @Body() meeting: CreateApplicationMeetingDto,
  ): Promise<ApplicationMeetingDto> {
    const application = await this.applicationService.get(
      meeting.applicationFileNumber,
    );

    if (!application) {
      throw new NotFoundException(
        `Application not found ${meeting.applicationFileNumber}`,
      );
    }

    const applicationType = await this.applicationCodeService.fetchMeetingType(
      meeting.meetingTypeCode,
    );

    if (!applicationType) {
      throw new NotFoundException(
        `Application Meeting Type not found ${meeting.meetingTypeCode}`,
      );
    }

    const newMeeting = await this.appDecisionMeetingService.createOrUpdate({
      startDate: new Date(meeting.startDate),
      endDate: new Date(meeting.endDate),
      applicationUuid: application.uuid,
      typeUuid: applicationType.uuid,
    });

    console.log(newMeeting, newMeeting);

    return this.mapper.map(
      newMeeting,
      ApplicationMeeting,
      ApplicationMeetingDto,
    );
  }

  @Patch()
  @UserRoles(...ANY_AUTH_ROLE)
  async update(
    @Body() appDecMeeting: ApplicationMeetingDto,
  ): Promise<ApplicationMeetingDto> {
    const appDecEntity = this.mapper.map(
      appDecMeeting,
      ApplicationMeetingDto,
      ApplicationMeeting,
    );
    const updatedMeeting = await this.appDecisionMeetingService.createOrUpdate(
      appDecEntity,
    );
    return this.mapper.map(
      updatedMeeting,
      ApplicationMeeting,
      ApplicationMeetingDto,
    );
  }
}
