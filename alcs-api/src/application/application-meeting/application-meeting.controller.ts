import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Logger,
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
import { ApplicationPaused } from '../application-paused.entity';
import { ApplicationPausedService } from '../application-paused/application-paused.service';
import { Application } from '../application.entity';
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
  private logger = new Logger(ApplicationMeetingController.name);

  constructor(
    private appMeetingService: ApplicationMeetingService,
    private applicationService: ApplicationService,
    private applicationCodeService: ApplicationCodeService,
    private applicationPausedService: ApplicationPausedService,
    @InjectMapper() private mapper: Mapper,
  ) {}

  @Get(':fileNumber')
  @UserRoles(...ANY_AUTH_ROLE)
  async getAllForApplication(
    @Param('fileNumber') fileNumber,
  ): Promise<ApplicationMeetingDto[]> {
    const meetings = await this.appMeetingService.getByAppFileNumber(
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
    const meeting = await this.appMeetingService.get(uuid);
    return this.mapper.mapAsync(
      meeting,
      ApplicationMeeting,
      ApplicationMeetingDto,
    );
  }

  @Delete('/:uuid')
  @UserRoles(...ANY_AUTH_ROLE)
  async delete(@Param('uuid') uuid: string) {
    return this.appMeetingService.remove(uuid);
  }

  private async createApplicationPaused(
    meeting: CreateApplicationMeetingDto,
    application: Application,
  ) {
    const pauseToCreate = this.mapper.map(
      meeting,
      CreateApplicationMeetingDto,
      ApplicationPaused,
    );
    return this.applicationPausedService.createOrUpdate({
      ...pauseToCreate,
      applicationUuid: application.uuid,
    });
  }

  private async validateAndPrepareCreateData(
    meeting: CreateApplicationMeetingDto,
  ) {
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

    return { application, applicationType };
  }

  @Post()
  @UserRoles(...ANY_AUTH_ROLE)
  async create(
    @Body() meeting: CreateApplicationMeetingDto,
  ): Promise<ApplicationMeetingDto> {
    const { application, applicationType } =
      await this.validateAndPrepareCreateData(meeting);

    const pause = await this.createApplicationPaused(meeting, application);

    let newMeeting;

    try {
      const meetingToCreate = this.mapper.map(
        meeting,
        CreateApplicationMeetingDto,
        ApplicationMeeting,
      );
      newMeeting = await this.appMeetingService.create({
        ...meetingToCreate,
        applicationUuid: application.uuid,
        typeUuid: applicationType.uuid,
        description: meeting.description ?? 'not specified', // TODO: not specified will be deleted in ALCS-96
        applicationPaused: pause,
      });
    } catch (exc) {
      this.logger.error(exc);
      // revert paused changes if insert fails
      await this.applicationPausedService.remove(pause.uuid);
      throw new InternalServerErrorException('Failed to create', exc);
    }

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
    const meeting = this.mapper.map(
      appDecMeeting,
      ApplicationMeetingDto,
      ApplicationMeeting,
    );

    const updatedMeeting = await this.appMeetingService.update(meeting);
    return this.mapper.map(
      updatedMeeting,
      ApplicationMeeting,
      ApplicationMeetingDto,
    );
  }
}
