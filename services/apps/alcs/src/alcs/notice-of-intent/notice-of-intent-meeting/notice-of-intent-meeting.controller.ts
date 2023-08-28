import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import { ServiceNotFoundException } from '../../../../../../libs/common/src/exceptions/base.exception';
import { ANY_AUTH_ROLE } from '../../../common/authorization/roles';
import { RolesGuard } from '../../../common/authorization/roles-guard.service';
import { UserRoles } from '../../../common/authorization/roles.decorator';
import { NoticeOfIntentService } from '../notice-of-intent.service';
import {
  CreateNoticeOfIntentMeetingDto,
  NoticeOfIntentMeetingDto,
  UpdateNoticeOfIntentMeetingDto,
} from './notice-of-intent-meeting.dto';
import { NoticeOfIntentMeeting } from './notice-of-intent-meeting.entity';
import { NoticeOfIntentMeetingService } from './notice-of-intent-meeting.service';

@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@UseGuards(RolesGuard)
@Controller('notice-of-intent-meeting')
export class NoticeOfIntentMeetingController {
  private logger = new Logger(NoticeOfIntentMeetingController.name);

  constructor(
    private noiMeetingService: NoticeOfIntentMeetingService,
    private noiService: NoticeOfIntentService,
    @InjectMapper() private mapper: Mapper,
  ) {}

  @Get(':fileNumber')
  @UserRoles(...ANY_AUTH_ROLE)
  async getAllForApplication(
    @Param('fileNumber') fileNumber,
  ): Promise<NoticeOfIntentMeetingDto[]> {
    const meetings = await this.noiMeetingService.getByFileNumber(fileNumber);

    return this.mapper.mapArrayAsync(
      meetings,
      NoticeOfIntentMeeting,
      NoticeOfIntentMeetingDto,
    );
  }

  @Get('/meeting/:uuid')
  @UserRoles(...ANY_AUTH_ROLE)
  async get(@Param('uuid') uuid: string): Promise<NoticeOfIntentMeetingDto> {
    const meeting = await this.noiMeetingService.get(uuid);
    return this.mapper.mapAsync(
      meeting,
      NoticeOfIntentMeeting,
      NoticeOfIntentMeetingDto,
    );
  }

  @Delete('/:uuid')
  @UserRoles(...ANY_AUTH_ROLE)
  async delete(@Param('uuid') uuid: string) {
    const appMeeting = await this.noiMeetingService.get(uuid);
    if (!appMeeting) {
      throw new ServiceNotFoundException(
        `Failed to find meeting with ID ${uuid}`,
      );
    }

    return this.noiMeetingService.remove(appMeeting);
  }

  private async validateAndPrepareCreateData(
    uuid: string,
    meeting: CreateNoticeOfIntentMeetingDto,
  ) {
    const noi = await this.noiService.getOrFailByUuid(uuid);
    const meetingType = (
      await this.noiMeetingService.fetNoticeOfIntentMeetingTypes()
    ).find((e) => e.code === meeting.meetingTypeCode);

    if (!meetingType) {
      throw new NotFoundException(
        `Application Meeting Type not found ${meeting.meetingTypeCode}`,
      );
    }

    return { noticeOfIntent: noi, meetingType };
  }

  @Post('/:uuid')
  @UserRoles(...ANY_AUTH_ROLE)
  async create(
    @Body() meeting: CreateNoticeOfIntentMeetingDto,
    @Param('uuid') uuid: string,
  ): Promise<NoticeOfIntentMeetingDto> {
    const { noticeOfIntent, meetingType } =
      await this.validateAndPrepareCreateData(uuid, meeting);

    const newMeeting = await this.noiMeetingService.create({
      noticeOfIntentUuid: noticeOfIntent.uuid,
      meetingTypeCode: meetingType.code,
      description: meeting.description,
      meetingStartDate: meeting.meetingStartDate,
      meetingEndDate: meeting.meetingEndDate,
    });

    return this.mapper.map(
      newMeeting,
      NoticeOfIntentMeeting,
      NoticeOfIntentMeetingDto,
    );
  }

  @Patch('/:uuid')
  @UserRoles(...ANY_AUTH_ROLE)
  async update(
    @Body() meetingUpdates: UpdateNoticeOfIntentMeetingDto,
    @Param('uuid') uuid: string,
  ): Promise<NoticeOfIntentMeetingDto> {
    const updatedMeeting = await this.noiMeetingService.update(
      uuid,
      meetingUpdates,
    );
    return this.mapper.map(
      updatedMeeting,
      NoticeOfIntentMeeting,
      NoticeOfIntentMeetingDto,
    );
  }
}
