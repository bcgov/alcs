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
import {
  BaseServiceException,
  ServiceValidationException,
} from '../../../../../libs/common/src/exceptions/base.exception';
import { generateCANCApplicationHtml } from '../../../../../templates/emails/cancelled';
import {
  generateSUBGTurApplicantHtml,
  generateSUBGNoReviewGovernmentTemplateEmail,
} from '../../../../../templates/emails/submitted-to-alc';
import { generateSUBGCoveApplicantHtml } from '../../../../../templates/emails/submitted-to-alc/cove-applicant.template';
import {
  generateSUBGApplicantHtml,
  generateSUBGGovernmentHtml,
} from '../../../../../templates/emails/submitted-to-lfng';
import { SUBMISSION_STATUS } from '../../alcs/application/application-submission-status/submission-status.dto';
import { ApplicationService } from '../../alcs/application/application.service';
import { PARENT_TYPE } from '../../alcs/card/card-subtask/card-subtask.dto';
import { LocalGovernment } from '../../alcs/local-government/local-government.entity';
import { LocalGovernmentService } from '../../alcs/local-government/local-government.service';
import { PortalAuthGuard } from '../../common/authorization/portal-auth-guard.service';
import { StatusEmailService } from '../../providers/email/status-email.service';
import { User } from '../../user/user.entity';
import { APPLICATION_SUBMISSION_TYPES } from '../pdf-generation/generate-submission-document.service';
import {
  ApplicationSubmissionValidatorService,
  ValidatedApplicationSubmission,
} from './application-submission-validator.service';
import {
  ApplicationSubmissionCreateDto,
  ApplicationSubmissionUpdateDto,
} from './application-submission.dto';
import { ApplicationSubmissionService } from './application-submission.service';

@Controller('application-submission')
@UseGuards(PortalAuthGuard)
export class ApplicationSubmissionController {
  private logger: Logger = new Logger(ApplicationSubmissionController.name);

  constructor(
    private applicationSubmissionService: ApplicationSubmissionService,
    private localGovernmentService: LocalGovernmentService,
    private applicationSubmissionValidatorService: ApplicationSubmissionValidatorService,
    private statusEmailService: StatusEmailService,
    private applicationService: ApplicationService,
  ) {}

  @Get()
  async list(@Req() req) {
    const user = req.user.entity as User;

    if (user.bceidBusinessGuid) {
      const localGovernments = await this.localGovernmentService.list();
      const matchingGovernment = localGovernments.find(
        (lg) => lg.bceidBusinessGuid === user.bceidBusinessGuid,
      );
      if (matchingGovernment) {
        const applications =
          await this.applicationSubmissionService.getForGovernment(
            matchingGovernment,
          );

        return this.applicationSubmissionService.mapToDTOs(
          [...applications],
          user,
          matchingGovernment,
        );
      }
    }

    const applications = await this.applicationSubmissionService.getByUser(
      user,
    );
    return this.applicationSubmissionService.mapToDTOs(applications, user);
  }

  @Get('/application/:fileId')
  async getSubmissionByFileId(@Req() req, @Param('fileId') fileId: string) {
    const user = req.user.entity as User;

    const submission =
      await this.applicationSubmissionService.verifyAccessByFileId(
        fileId,
        user,
      );

    if (user.bceidBusinessGuid) {
      const localGovernment = await this.localGovernmentService.getByGuid(
        user.bceidBusinessGuid,
      );
      if (
        localGovernment &&
        submission.localGovernmentUuid === localGovernment.uuid
      ) {
        return await this.applicationSubmissionService.mapToDetailedDTO(
          submission,
          localGovernment,
        );
      }
    }

    return await this.applicationSubmissionService.mapToDetailedDTO(submission);
  }

  @Get('/:uuid')
  async getSubmission(@Req() req, @Param('uuid') uuid: string) {
    const user = req.user.entity as User;

    const submission =
      await this.applicationSubmissionService.verifyAccessByUuid(uuid, user);

    if (user.bceidBusinessGuid) {
      const localGovernment = await this.localGovernmentService.getByGuid(
        user.bceidBusinessGuid,
      );
      if (
        localGovernment &&
        localGovernment.uuid === submission.localGovernmentUuid
      ) {
        return await this.applicationSubmissionService.mapToDetailedDTO(
          submission,
          localGovernment,
        );
      }
    }

    return await this.applicationSubmissionService.mapToDetailedDTO(submission);
  }

  @Post()
  async create(@Req() req, @Body() body: ApplicationSubmissionCreateDto) {
    const { type, prescribedBody } = body;
    const user = req.user.entity as User;
    const newFileNumber = await this.applicationSubmissionService.create(
      type,
      user,
      prescribedBody,
    );
    return {
      fileId: newFileNumber,
    };
  }

  @Put('/:uuid')
  async update(
    @Param('uuid') uuid: string,
    @Body() updateDto: ApplicationSubmissionUpdateDto,
    @Req() req,
  ) {
    const submission =
      await this.applicationSubmissionService.verifyAccessByUuid(
        uuid,
        req.user.entity,
      );

    if (
      !submission.isDraft &&
      (!submission.status ||
        ![
          SUBMISSION_STATUS.INCOMPLETE.toString(),
          SUBMISSION_STATUS.WRONG_GOV.toString(),
          SUBMISSION_STATUS.IN_PROGRESS.toString(),
        ].includes(submission.status.statusTypeCode))
    ) {
      throw new ServiceValidationException('Not allowed to update submission');
    }

    const updatedSubmission = await this.applicationSubmissionService.update(
      submission.uuid,
      updateDto,
    );

    return await this.applicationSubmissionService.mapToDetailedDTO(
      updatedSubmission,
      req.user.entity,
    );
  }

  @Post('/:uuid/cancel')
  async cancel(@Param('uuid') uuid: string, @Req() req) {
    const user = req.user.entity;

    const application =
      await this.applicationSubmissionService.verifyAccessByUuid(
        uuid,
        req.user.entity,
      );
    let localGovernment: LocalGovernment | null = null;

    if (user.bceidBusinessGuid) {
      localGovernment = await this.localGovernmentService.getByGuid(
        user.bceidBusinessGuid,
      );
    }

    if (
      localGovernment === null &&
      application.status.statusTypeCode !== SUBMISSION_STATUS.IN_PROGRESS
    ) {
      throw new BadRequestException('Can only cancel in progress Applications');
    }

    const { primaryContact, submissionGovernment } =
      await this.statusEmailService.getApplicationEmailData(
        application.fileNumber,
        application,
      );

    if (primaryContact) {
      await this.statusEmailService.sendApplicationStatusEmail({
        generateStatusHtml: generateCANCApplicationHtml,
        status: SUBMISSION_STATUS.CANCELLED,
        applicationSubmission: application,
        government: submissionGovernment,
        parentType: PARENT_TYPE.APPLICATION,
        primaryContact,
        ccGovernment: !!submissionGovernment,
      });
    }

    await this.applicationSubmissionService.cancel(application);

    return {
      cancelled: true,
    };
  }

  @Post('/alcs/submit/:uuid')
  async submitAsApplicant(@Param('uuid') uuid: string, @Req() req) {
    const applicationSubmission =
      await this.applicationSubmissionService.verifyAccessByUuid(
        uuid,
        req.user.entity,
      );

    const validationResult =
      await this.applicationSubmissionValidatorService.validateSubmission(
        applicationSubmission,
      );

    if (validationResult.submission) {
      return await this.submitValidatedSubmission(
        validationResult.submission,
        req.user.entity,
      );
    } else {
      this.logger.debug(validationResult.errors);
      throw new BadRequestException('Invalid Application');
    }
  }

  private async submitValidatedSubmission(
    validatedSubmission: ValidatedApplicationSubmission,
    user: User,
  ) {
    const applicationTypes =
      await this.applicationService.fetchApplicationTypes();
    const matchingType = applicationTypes.find(
      (type) => type.code === validatedSubmission.typeCode,
    );

    if (!matchingType) {
      throw new BaseServiceException(
        `Failed to find Application Type Matching ${validatedSubmission.typeCode}`,
      );
    }

    const { primaryContact, submissionGovernment } =
      await this.statusEmailService.getApplicationEmailData(
        validatedSubmission.fileNumber,
        validatedSubmission,
      );

    if (matchingType.requiresGovernmentReview) {
      const wasSubmittedToLfng = validatedSubmission.submissionStatuses.find(
        (s) =>
          [
            SUBMISSION_STATUS.SUBMITTED_TO_LG,
            SUBMISSION_STATUS.IN_REVIEW_BY_LG,
            SUBMISSION_STATUS.WRONG_GOV,
            SUBMISSION_STATUS.INCOMPLETE,
          ].includes(s.statusTypeCode as SUBMISSION_STATUS) &&
          !!s.effectiveDate,
      );

      // Send status emails for first time submissions
      if (!wasSubmittedToLfng) {
        if (primaryContact) {
          await this.statusEmailService.sendApplicationStatusEmail({
            generateStatusHtml: generateSUBGApplicantHtml,
            status: SUBMISSION_STATUS.SUBMITTED_TO_LG,
            applicationSubmission: validatedSubmission,
            government: submissionGovernment,
            parentType: PARENT_TYPE.APPLICATION,
            primaryContact,
          });
        }

        if (submissionGovernment) {
          await this.statusEmailService.sendApplicationStatusEmail({
            generateStatusHtml: generateSUBGGovernmentHtml,
            status: SUBMISSION_STATUS.SUBMITTED_TO_LG,
            applicationSubmission: validatedSubmission,
            government: submissionGovernment,
            parentType: PARENT_TYPE.APPLICATION,
          });
        }
      }

      return await this.applicationSubmissionService.submitToLg(
        validatedSubmission,
      );
    } else {
      await this.applicationSubmissionService.submitToAlcs(
        validatedSubmission,
        user,
      );

      if (primaryContact) {
        if (
          matchingType.code === APPLICATION_SUBMISSION_TYPES.TURP ||
          matchingType.code === APPLICATION_SUBMISSION_TYPES.COVE
        ) {
          const generateTemplateFunction =
            matchingType.code === APPLICATION_SUBMISSION_TYPES.TURP
              ? generateSUBGTurApplicantHtml
              : generateSUBGCoveApplicantHtml;

          await this.statusEmailService.sendApplicationStatusEmail({
            generateStatusHtml: generateTemplateFunction,
            status: SUBMISSION_STATUS.SUBMITTED_TO_ALC,
            applicationSubmission: validatedSubmission,
            government: submissionGovernment,
            parentType: PARENT_TYPE.APPLICATION,
            primaryContact,
          });
        }

        if (submissionGovernment) {
          await this.statusEmailService.sendApplicationStatusEmail({
            generateStatusHtml: generateSUBGNoReviewGovernmentTemplateEmail,
            status: SUBMISSION_STATUS.SUBMITTED_TO_ALC,
            applicationSubmission: validatedSubmission,
            government: submissionGovernment,
            parentType: PARENT_TYPE.APPLICATION,
          });
        }

        return await this.applicationSubmissionService.updateStatus(
          validatedSubmission,
          SUBMISSION_STATUS.SUBMITTED_TO_ALC,
        );
      }
    }
  }
}
