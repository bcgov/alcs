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
import { template as submNoiApplicantTemplate } from '../../../../../templates/emails/submitted-to-alc/noi-applicant.template';
import { template as submNoiGovernmentTemplate } from '../../../../../templates/emails/submitted-to-alc/noi-government.template';
import { PARENT_TYPE } from '../../alcs/card/card-subtask/card-subtask.dto';
import { LocalGovernmentService } from '../../alcs/local-government/local-government.service';
import { NOI_SUBMISSION_STATUS } from '../../alcs/notice-of-intent/notice-of-intent-submission-status/notice-of-intent-status.dto';
import { PortalAuthGuard } from '../../common/authorization/portal-auth-guard.service';
import { ROLES_ALLOWED_APPLICATIONS } from '../../common/authorization/roles';
import { TrackingService } from '../../common/tracking/tracking.service';
import { StatusEmailService } from '../../providers/email/status-email.service';
import { User } from '../../user/user.entity';
import { NoticeOfIntentSubmissionValidatorService } from './notice-of-intent-submission-validator.service';
import {
  NoticeOfIntentSubmissionCreateDto,
  NoticeOfIntentSubmissionUpdateDto,
} from './notice-of-intent-submission.dto';
import { NoticeOfIntentSubmissionService } from './notice-of-intent-submission.service';

@Controller('notice-of-intent-submission')
@UseGuards(PortalAuthGuard)
export class NoticeOfIntentSubmissionController {
  private logger: Logger = new Logger(NoticeOfIntentSubmissionController.name);

  constructor(
    private noticeOfIntentSubmissionService: NoticeOfIntentSubmissionService,
    private noticeOfIntentValidatorService: NoticeOfIntentSubmissionValidatorService,
    private statusEmailService: StatusEmailService,
    private localGovernmentService: LocalGovernmentService,
    private trackingService: TrackingService,
  ) {}

  @Get()
  async getSubmissions(@Req() req) {
    const user = req.user.entity as User;

    const applications =
      await this.noticeOfIntentSubmissionService.getAllByUser(user);
    return this.noticeOfIntentSubmissionService.mapToDTOs(applications, user);
  }

  @Get('/notice-of-intent/:fileId')
  async getSubmissionByFileId(@Req() req, @Param('fileId') fileId: string) {
    const user = req.user.entity as User;

    const submission =
      await this.noticeOfIntentSubmissionService.getByFileNumber(fileId, user);

    if (user && user.bceidBusinessGuid) {
      const matchingLocalGovernment =
        await this.localGovernmentService.getByGuid(user.bceidBusinessGuid);
      if (matchingLocalGovernment) {
        await this.trackingService.trackView(user, fileId);
      }
    }

    return await this.noticeOfIntentSubmissionService.mapToDetailedDTO(
      submission,
      user,
    );
  }

  @Get('/:uuid')
  async getSubmission(@Req() req, @Param('uuid') uuid: string) {
    const user = req.user.entity as User;

    const submission = await this.noticeOfIntentSubmissionService.getByUuid(
      uuid,
      user,
    );

    return await this.noticeOfIntentSubmissionService.mapToDetailedDTO(
      submission,
      user,
    );
  }

  @Post()
  async create(@Req() req, @Body() body: NoticeOfIntentSubmissionCreateDto) {
    const { type } = body;
    const user = req.user.entity as User;
    const newFileNumber = await this.noticeOfIntentSubmissionService.create(
      type,
      user,
    );
    return {
      fileId: newFileNumber,
    };
  }

  @Put('/:uuid')
  async update(
    @Param('uuid') uuid: string,
    @Body() updateDto: NoticeOfIntentSubmissionUpdateDto,
    @Req() req,
  ) {
    const noticeOfIntentSubmission =
      await this.noticeOfIntentSubmissionService.getByUuid(
        uuid,
        req.user.entity,
      );

    const overlappingRoles = ROLES_ALLOWED_APPLICATIONS.filter((value) =>
      req.user.entity.clientRoles!.includes(value),
    );

    if (
      noticeOfIntentSubmission.status.statusTypeCode !==
        NOI_SUBMISSION_STATUS.IN_PROGRESS &&
      overlappingRoles.length === 0
    ) {
      throw new BadRequestException(
        'Can only edit in progress Notice of Intents',
      );
    }

    const updatedSubmission = await this.noticeOfIntentSubmissionService.update(
      uuid,
      updateDto,
      req.user.entity,
    );

    return await this.noticeOfIntentSubmissionService.mapToDetailedDTO(
      updatedSubmission,
      req.user.entity,
    );
  }

  @Post('/:uuid/cancel')
  async cancel(@Param('uuid') uuid: string, @Req() req) {
    const noticeOfIntentSubmission =
      await this.noticeOfIntentSubmissionService.getByUuid(
        uuid,
        req.user.entity,
      );

    if (
      noticeOfIntentSubmission.status.statusTypeCode !==
      NOI_SUBMISSION_STATUS.IN_PROGRESS
    ) {
      throw new BadRequestException(
        'Can only cancel in progress Notice of Intents',
      );
    }

    await this.noticeOfIntentSubmissionService.cancel(noticeOfIntentSubmission);

    return {
      cancelled: true,
    };
  }

  @Post('/alcs/submit/:uuid')
  async submitAsApplicant(@Param('uuid') uuid: string, @Req() req) {
    const noticeOfIntentSubmission =
      await this.noticeOfIntentSubmissionService.getByUuid(
        uuid,
        req.user.entity,
      );

    const validationResult =
      await this.noticeOfIntentValidatorService.validateSubmission(
        noticeOfIntentSubmission,
      );

    if (validationResult.noticeOfIntentSubmission) {
      const validatedApplicationSubmission =
        validationResult.noticeOfIntentSubmission;

      await this.noticeOfIntentSubmissionService.submitToAlcs(
        validatedApplicationSubmission,
        req.user.entity,
      );

      const { primaryContact, submissionGovernment } =
        await this.statusEmailService.getNoticeOfIntentEmailData(
          noticeOfIntentSubmission,
        );

      if (primaryContact) {
        await this.statusEmailService.sendNoticeOfIntentStatusEmail({
          template: submNoiApplicantTemplate,
          status: NOI_SUBMISSION_STATUS.SUBMITTED_TO_ALC,
          noticeOfIntentSubmission,
          government: submissionGovernment,
          parentType: PARENT_TYPE.NOTICE_OF_INTENT,
          primaryContact,
          ccEmails: [],
        });
      }

      if (submissionGovernment) {
        await this.statusEmailService.sendNoticeOfIntentStatusEmail({
          template: submNoiGovernmentTemplate,
          status: NOI_SUBMISSION_STATUS.SUBMITTED_TO_ALC,
          noticeOfIntentSubmission,
          government: submissionGovernment,
          parentType: PARENT_TYPE.NOTICE_OF_INTENT,
          ccEmails: [],
        });
      }

      const finalSubmission =
        await this.noticeOfIntentSubmissionService.getByUuid(
          uuid,
          req.user.entity,
        );

      return await this.noticeOfIntentSubmissionService.mapToDetailedDTO(
        finalSubmission,
        req.user.entity,
      );
    } else {
      this.logger.debug(validationResult.errors);
      throw new BadRequestException('Invalid Notice of Intent');
    }
  }
}
