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
import { ApplicationService } from '../application.service';
import {
  ApplicationDecisionMeetingDto,
  CreateApplicationDecisionMeetingDto,
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
    @InjectMapper() private mapper: Mapper,
  ) {}

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
    const application = await this.applicationService.get(
      meeting.applicationFileNumber,
    );

    if (!application) {
      throw new NotFoundException(
        `Application not found ${meeting.applicationFileNumber}`,
      );
    }

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
