import { Mapper } from 'automapper-core';
import { InjectMapper } from 'automapper-nestjs';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PortalAuthGuard } from '../../../common/authorization/portal-auth-guard.service';
import { OWNER_TYPE } from '../../../common/owner-type/owner-type.entity';
import {
  NoticeOfIntentOwnerCreateDto,
  NoticeOfIntentOwnerUpdateDto,
} from '../../notice-of-intent-submission/notice-of-intent-owner/notice-of-intent-owner.dto';
import { NotificationSubmissionService } from '../notification-submission.service';
import {
  NotificationTransfereeCreateDto,
  NotificationTransfereeDto,
  NotificationTransfereeUpdateDto,
} from './notification-transferee.dto';
import { NotificationTransferee } from './notification-transferee.entity';
import { NotificationTransfereeService } from './notification-transferee.service';

@Controller('notification-transferee')
@UseGuards(PortalAuthGuard)
export class NotificationTransfereeController {
  constructor(
    private ownerService: NotificationTransfereeService,
    private notificationSubmissionService: NotificationSubmissionService,
    @InjectMapper() private mapper: Mapper,
  ) {}

  @Get('submission/:submissionUuid')
  async fetchByFileId(
    @Param('submissionUuid') submissionUuid: string,
    @Req() req,
  ): Promise<NotificationTransfereeDto[]> {
    const notificationSubmission =
      await this.notificationSubmissionService.getByUuid(
        submissionUuid,
        req.user.entity,
      );

    return this.mapper.mapArrayAsync(
      notificationSubmission.transferees,
      NotificationTransferee,
      NotificationTransfereeDto,
    );
  }

  @Post()
  async create(
    @Body() createDto: NotificationTransfereeCreateDto,
    @Req() req,
  ): Promise<NotificationTransfereeDto> {
    this.verifyDto(createDto);

    const noticeOfIntentSubmission =
      await this.notificationSubmissionService.getByUuid(
        createDto.notificationSubmissionUuid,
        req.user.entity,
      );
    const owner = await this.ownerService.create(
      createDto,
      noticeOfIntentSubmission,
      req.user.entity,
    );

    return this.mapper.mapAsync(
      owner,
      NotificationTransferee,
      NotificationTransfereeDto,
    );
  }

  @Patch('/:uuid')
  async update(
    @Param('uuid') uuid: string,
    @Body() updateDto: NotificationTransfereeUpdateDto,
    @Req() req,
  ) {
    this.verifyDto(updateDto);

    const newParcel = await this.ownerService.update(
      uuid,
      updateDto,
      req.user.entity,
    );

    return this.mapper.mapAsync(
      newParcel,
      NotificationTransferee,
      NotificationTransfereeDto,
    );
  }

  @Delete('/:uuid')
  async delete(@Param('uuid') uuid: string, @Req() req) {
    const owner = await this.verifyAccessAndGetOwner(req, uuid);
    await this.ownerService.delete(owner, req.user.entity);
    return { uuid };
  }

  private verifyDto(
    dto: NoticeOfIntentOwnerUpdateDto | NoticeOfIntentOwnerCreateDto,
  ) {
    if (
      dto.typeCode === OWNER_TYPE.INDIVIDUAL &&
      (!dto.firstName || !dto.lastName)
    ) {
      throw new BadRequestException(
        'Individuals require both first and last name',
      );
    }

    if (dto.typeCode === OWNER_TYPE.ORGANIZATION && !dto.organizationName) {
      throw new BadRequestException(
        'Organizations must have an organizationName',
      );
    }
  }

  private async verifyAccessAndGetOwner(@Req() req, ownerUuid: string) {
    const owner = await this.ownerService.getOwner(ownerUuid);
    await this.notificationSubmissionService.getByUuid(
      owner.notificationSubmissionUuid,
      req.user.entity,
    );

    return owner;
  }
}
