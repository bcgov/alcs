import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PortalAuthGuard } from '../../common/authorization/portal-auth-guard.service';
import { User } from '../../user/user.entity';
import { NotificationSubmissionUpdateDto } from './notification-submission.dto';
import { NotificationSubmissionService } from './notification-submission.service';

@Controller('notification-submission')
@UseGuards(PortalAuthGuard)
export class NotificationSubmissionController {
  private logger: Logger = new Logger(NotificationSubmissionController.name);

  constructor(
    private notificationSubmissionService: NotificationSubmissionService,
  ) {}

  @Get()
  async getSubmissions(@Req() req) {
    const user = req.user.entity as User;

    const notificationSubmissions =
      await this.notificationSubmissionService.getAllByUser(user);
    return this.notificationSubmissionService.mapToDTOs(
      notificationSubmissions,
      user,
    );
  }

  @Get('/notification/:fileId')
  async getSubmissionByFileId(@Req() req, @Param('fileId') fileId: string) {
    const user = req.user.entity as User;

    const submission = await this.notificationSubmissionService.getByFileNumber(
      fileId,
      user,
    );

    return await this.notificationSubmissionService.mapToDetailedDTO(
      submission,
      user,
    );
  }

  @Get('/:uuid')
  async getSubmission(@Req() req, @Param('uuid') uuid: string) {
    const user = req.user.entity as User;

    const submission = await this.notificationSubmissionService.getByUuid(
      uuid,
      user,
    );

    return await this.notificationSubmissionService.mapToDetailedDTO(
      submission,
      user,
    );
  }

  @Post()
  async create(@Req() req) {
    const user = req.user.entity as User;
    const newFileNumber = await this.notificationSubmissionService.create(
      'SRW',
      user,
    );
    return {
      fileId: newFileNumber,
    };
  }

  @Put('/:uuid')
  async update(
    @Param('uuid') uuid: string,
    @Body() updateDto: NotificationSubmissionUpdateDto,
    @Req() req,
  ) {
    // const noticeOfIntentSubmission = await this.notificationSubmissionService.getByUuid(
    //   uuid,
    //   req.user.entity,
    // );
    //
    // if (
    //   noticeOfIntentSubmission.status.statusTypeCode !==
    //     NOI_SUBMISSION_STATUS.IN_PROGRESS &&
    //   overlappingRoles.length === 0
    // ) {
    //   throw new BadRequestException('Can only edit in progress SRWs');
    // }

    const updatedSubmission = await this.notificationSubmissionService.update(
      uuid,
      updateDto,
      req.user.entity,
    );

    return await this.notificationSubmissionService.mapToDetailedDTO(
      updatedSubmission,
      req.user.entity,
    );
  }

  @Post('/:uuid/cancel')
  async cancel(@Param('uuid') uuid: string, @Req() req) {
    const noticeOfIntentSubmission =
      await this.notificationSubmissionService.getByUuid(uuid, req.user.entity);

    // if (
    //   noticeOfIntentSubmission.status.statusTypeCode !==
    //   NOI_SUBMISSION_STATUS.IN_PROGRESS
    // ) {
    //   throw new BadRequestException('Can only cancel in progress SRWs');
    // }

    await this.notificationSubmissionService.cancel(noticeOfIntentSubmission);

    return {
      cancelled: true,
    };
  }

  @Post('/alcs/submit/:uuid')
  async submitAsApplicant(@Param('uuid') uuid: string, @Req() req) {
    const notificationSubmission =
      await this.notificationSubmissionService.getByUuid(uuid, req.user.entity);

    await this.notificationSubmissionService.submitToAlcs(
      notificationSubmission,
    );

    const finalSubmission = await this.notificationSubmissionService.getByUuid(
      uuid,
      req.user.entity,
    );

    return await this.notificationSubmissionService.mapToDetailedDTO(
      finalSubmission,
      req.user.entity,
    );
  }
}
