import { ServiceNotFoundException } from '@app/common/exceptions/base.exception';
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
import { CodeService } from '../../code/code.service';
import { ANY_AUTH_ROLE } from '../../../common/authorization/roles';
import { RolesGuard } from '../../../common/authorization/roles-guard.service';
import { UserRoles } from '../../../common/authorization/roles.decorator';
import { ApplicationPaused } from '../application-paused.entity';
import { ApplicationPausedService } from '../application-paused/application-paused.service';
import { Application } from '../application.entity';
import { ApplicationService } from '../application.service';
import {
  ApplicationMeetingDto,
  CreateApplicationMeetingDto,
  UpdateApplicationMeetingDto,
} from './application-meeting.dto';
import { ApplicationMeeting } from './application-meeting.entity';
import { ApplicationMeetingService } from './application-meeting.service';

@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@Controller('application-meeting')
@UseGuards(RolesGuard)
export class ApplicationMeetingController {
  private logger = new Logger(ApplicationMeetingController.name);

  constructor(
    private appMeetingService: ApplicationMeetingService,
    private applicationService: ApplicationService,
    private applicationCodeService: CodeService,
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
    const appMeeting = await this.appMeetingService.get(uuid);
    if (!appMeeting) {
      throw new ServiceNotFoundException(
        `Failed to find meeting with ID ${uuid}`,
      );
    }
    await this.applicationPausedService.remove(appMeeting.meetingPause!.uuid);
    if (appMeeting.reportPause) {
      await this.applicationPausedService.remove(appMeeting.reportPause.uuid);
    }
    return this.appMeetingService.remove(appMeeting);
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
    fileNumber: string,
    meeting: CreateApplicationMeetingDto,
  ) {
    const application = await this.applicationService.getOrFail(fileNumber);
    const meetingType = await this.applicationCodeService.fetchMeetingType(
      meeting.meetingTypeCode,
    );

    if (!meetingType) {
      throw new NotFoundException(
        `Application Meeting Type not found ${meeting.meetingTypeCode}`,
      );
    }

    return { application, meetingType };
  }

  @Post('/:fileNumber')
  @UserRoles(...ANY_AUTH_ROLE)
  async create(
    @Body() meeting: CreateApplicationMeetingDto,
    @Param('fileNumber') fileNumber: string,
  ): Promise<ApplicationMeetingDto> {
    const { application, meetingType } =
      await this.validateAndPrepareCreateData(fileNumber, meeting);

    const pause = await this.createApplicationPaused(meeting, application);

    try {
      const newMeeting = await this.appMeetingService.create({
        application: application,
        type: meetingType,
        description: meeting.description,
        meetingPause: pause,
      });

      return this.mapper.map(
        newMeeting,
        ApplicationMeeting,
        ApplicationMeetingDto,
      );
    } catch (exc) {
      this.logger.error(exc);
      // revert paused changes if insert fails
      await this.applicationPausedService.remove(pause.uuid);
      throw new InternalServerErrorException('Failed to create', exc);
    }
  }

  @Patch('/:uuid')
  @UserRoles(...ANY_AUTH_ROLE)
  async update(
    @Body() meetingUpdates: UpdateApplicationMeetingDto,
    @Param('uuid') uuid: string,
  ): Promise<ApplicationMeetingDto> {
    const updatedMeeting = await this.appMeetingService.update(
      uuid,
      meetingUpdates,
    );
    return this.mapper.map(
      updatedMeeting,
      ApplicationMeeting,
      ApplicationMeetingDto,
    );
  }
}
