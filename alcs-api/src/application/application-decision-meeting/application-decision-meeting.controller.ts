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
import { ApplicationDecisionMeetingDto } from './application-decision-meeting.dto';
import { ApplicationDecisionMeeting } from './application-decision-meeting.entity';
import { ApplicationDecisionMeetingService } from './application-decision-meeting.service';

@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@Controller('application-decision-meeting')
@UseGuards(RoleGuard)
export class ApplicationDecisionMeetingController {
  constructor(
    private appDecisionMeetingService: ApplicationDecisionMeetingService,
    @InjectMapper() private mapper: Mapper,
  ) {}

  @Get()
  @UserRoles(...ANY_AUTH_ROLE)
  async get(
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

  @Delete()
  @UserRoles(...ANY_AUTH_ROLE)
  async delete(@Body() uuid: string) {
    return this.appDecisionMeetingService.delete(uuid);
  }

  @Post()
  @UserRoles(...ANY_AUTH_ROLE)
  async create(@Body() date: number): Promise<ApplicationDecisionMeetingDto> {
    const newMeeting = await this.appDecisionMeetingService.createOrUpdate({
      date: new Date(date),
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
    const existingMeeting = await this.appDecisionMeetingService.get(
      appDecMeeting.uuid,
    );

    if (!existingMeeting) {
      throw new NotFoundException(
        `Decision meeting not found ${appDecMeeting.uuid}`,
      );
    }

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
