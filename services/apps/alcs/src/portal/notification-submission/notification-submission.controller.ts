import {
  BadRequestException,
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
import { LocalGovernmentService } from '../../alcs/local-government/local-government.service';
import { NOTIFICATION_STATUS } from '../../alcs/notification/notification-submission-status/notification-status.dto';
import { PortalAuthGuard } from '../../common/authorization/portal-auth-guard.service';
import { TrackingService } from '../../common/tracking/tracking.service';
import { User } from '../../user/user.entity';
import { GenerateSrwDocumentService } from '../pdf-generation/generate-srw-document.service';
import { NotificationSubmissionValidatorService } from './notification-submission-validator.service';
import { NotificationSubmissionUpdateDto } from './notification-submission.dto';
import { NotificationSubmission } from './notification-submission.entity';
import { NotificationSubmissionService } from './notification-submission.service';
import { BaseServiceException } from '@app/common/exceptions/base.exception';

@Controller('notification-submission')
@UseGuards(PortalAuthGuard)
export class NotificationSubmissionController {
  private logger: Logger = new Logger(NotificationSubmissionController.name);

  constructor(
    private notificationSubmissionService: NotificationSubmissionService,
    private notificationValidationService: NotificationSubmissionValidatorService,
    private generateSrwDocumentService: GenerateSrwDocumentService,
    private localGovernmentService: LocalGovernmentService,
    private trackingService: TrackingService,
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

    if (user && user.bceidBusinessGuid) {
      const matchingLocalGovernment =
        await this.localGovernmentService.getByGuid(user.bceidBusinessGuid);
      if (matchingLocalGovernment) {
        await this.trackingService.trackView(user, fileId);
      }
    }

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
    const submission = await this.notificationSubmissionService.getByUuid(
      uuid,
      req.user.entity,
    );

    if (submission.status.statusTypeCode !== NOTIFICATION_STATUS.IN_PROGRESS) {
      throw new BadRequestException('Can only edit in progress SRWs');
    }

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
    const notificationSubmission =
      await this.notificationSubmissionService.getByUuid(uuid, req.user.entity);

    if (
      notificationSubmission.status.statusTypeCode !==
      NOTIFICATION_STATUS.IN_PROGRESS
    ) {
      throw new BadRequestException('Can only cancel in progress SRWs');
    }

    await this.notificationSubmissionService.cancel(notificationSubmission);

    return {
      cancelled: true,
    };
  }

  @Post('/alcs/submit/:uuid')
  async submitAsApplicant(@Param('uuid') uuid: string, @Req() req) {
    const notificationSubmission =
      await this.notificationSubmissionService.getByUuid(uuid, req.user.entity);

    const validationResult =
      await this.notificationValidationService.validateSubmission(
        notificationSubmission,
      );

    if (validationResult.noticeOfIntentSubmission) {
      const validatedApplicationSubmission =
        validationResult.noticeOfIntentSubmission;

      await this.notificationSubmissionService.submitToAlcs(
        validatedApplicationSubmission,
      );

      await this.generatePdf(notificationSubmission, req.user.entity);

      const finalSubmission =
        await this.notificationSubmissionService.getByUuid(
          uuid,
          req.user.entity,
        );

      return await this.notificationSubmissionService.mapToDetailedDTO(
        finalSubmission,
        req.user.entity,
      );
    } else {
      this.logger.debug(validationResult.errors);
      throw new BadRequestException('Invalid Notification');
    }
  }

  private async generatePdf(submission: NotificationSubmission, user: User) {
    const savedDocument =
      await this.generateSrwDocumentService.generateAndAttach(
        submission.fileNumber,
        user,
      );

    if (savedDocument) {
      await this.notificationSubmissionService.sendAndRecordLTSAPackage(submission, savedDocument, user);
    } else {
      throw new BaseServiceException('A document failed to generate', undefined, 'DocumentGenerationError');
    }
  }
}
