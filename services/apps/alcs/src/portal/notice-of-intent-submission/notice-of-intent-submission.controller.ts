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
import { NOI_SUBMISSION_STATUS } from '../../alcs/notice-of-intent/notice-of-intent-submission-status/notice-of-intent-status.dto';
import { PortalAuthGuard } from '../../common/authorization/portal-auth-guard.service';
import { ROLES_ALLOWED_APPLICATIONS } from '../../common/authorization/roles';
import { User } from '../../user/user.entity';
import { NoticeOfIntentSubmissionValidatorService } from './notice-of-intent-submission-validator.service';
import {
  NoticeOfIntentSubmissionCreateDto,
  NoticeOfIntentSubmissionUpdateDto,
} from './notice-of-intent-submission.dto';
import { NoticeOfIntentSubmissionService } from './notice-of-intent-submission.service';
import { EmailService } from '../../providers/email/email.service';
import {
  generateSUBMNoiApplicantHtml,
  generateSUBMNoiGovernmentHtml,
} from '../../../../../templates/emails/submitted-to-alc';
import { ParentType } from '../../common/dtos/base.dto';
import { generateCANCNoticeOfIntentHtml } from '../../../../../templates/emails/cancelled';

@Controller('notice-of-intent-submission')
@UseGuards(PortalAuthGuard)
export class NoticeOfIntentSubmissionController {
  private logger: Logger = new Logger(NoticeOfIntentSubmissionController.name);

  constructor(
    private noticeOfIntentSubmissionService: NoticeOfIntentSubmissionService,
    private noticeOfIntentValidatorService: NoticeOfIntentSubmissionValidatorService,
    private emailService: EmailService,
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

    // TODO: Dry up code
    const primaryContact = noticeOfIntentSubmission.owners?.find(
      (owner) =>
        owner.uuid === noticeOfIntentSubmission.primaryContactOwnerUuid,
    );

    const submissionGovernment = noticeOfIntentSubmission.localGovernmentUuid
      ? await this.emailService.getSubmissionGovernmentOrFail(
          noticeOfIntentSubmission,
        )
      : null;

    if (primaryContact) {
      await this.emailService.sendNoticeOfIntentStatusEmail({
        generateStatusHtml: generateCANCNoticeOfIntentHtml,
        status: NOI_SUBMISSION_STATUS.CANCELLED,
        noticeOfIntentSubmission,
        government: submissionGovernment,
        parentType: ParentType.Application,
        primaryContact,
        ccGovernment: !!submissionGovernment,
      });
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
      );

      // TODO: Refactor and add unit test
      const primaryContact = noticeOfIntentSubmission.owners?.find(
        (owner) =>
          owner.uuid === noticeOfIntentSubmission.primaryContactOwnerUuid,
      );

      const submissionGovernment = noticeOfIntentSubmission.localGovernmentUuid
        ? await this.emailService.getSubmissionGovernmentOrFail(
            noticeOfIntentSubmission,
          )
        : null;

      if (primaryContact) {
        await this.emailService.sendNoticeOfIntentStatusEmail({
          generateStatusHtml: generateSUBMNoiApplicantHtml,
          status: NOI_SUBMISSION_STATUS.SUBMITTED_TO_ALC,
          noticeOfIntentSubmission,
          government: submissionGovernment,
          parentType: ParentType.NoticeOfIntent,
          primaryContact,
        });
      }

      if (submissionGovernment) {
        await this.emailService.sendNoticeOfIntentStatusEmail({
          generateStatusHtml: generateSUBMNoiGovernmentHtml,
          status: NOI_SUBMISSION_STATUS.SUBMITTED_TO_ALC,
          noticeOfIntentSubmission,
          government: submissionGovernment,
          parentType: ParentType.NoticeOfIntent,
        });
      }

      debugger;

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
