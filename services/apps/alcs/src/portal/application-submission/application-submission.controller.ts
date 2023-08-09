import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Logger,
  NotFoundException,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApplicationLocalGovernment } from '../../alcs/application/application-code/application-local-government/application-local-government.entity';
import { ApplicationLocalGovernmentService } from '../../alcs/application/application-code/application-local-government/application-local-government.service';
import { SUBMISSION_STATUS } from '../../application-submission-status/submission-status.dto';
import { PortalAuthGuard } from '../../common/authorization/portal-auth-guard.service';
import { User } from '../../user/user.entity';
import { ApplicationSubmissionValidatorService } from './application-submission-validator.service';
import {
  ApplicationSubmissionCreateDto,
  ApplicationSubmissionUpdateDto,
} from './application-submission.dto';
import { ApplicationSubmissionService } from './application-submission.service';
import { ApplicationSubmission } from './application-submission.entity';
import { ApplicationOwner } from './application-owner/application-owner.entity';
import { ApplicationService } from '../../alcs/application/application.service';
import {
  generateStatusApplicantHtml,
  generateStatusGovernmentHtml,
} from '../../../../../templates/emails/submitted-to-lfng';
import { EmailService } from '../../providers/email/email.service';

@Controller('application-submission')
@UseGuards(PortalAuthGuard)
export class ApplicationSubmissionController {
  private logger: Logger = new Logger(ApplicationSubmissionController.name);

  constructor(
    private applicationSubmissionService: ApplicationSubmissionService,
    private localGovernmentService: ApplicationLocalGovernmentService,
    private applicationSubmissionValidatorService: ApplicationSubmissionValidatorService,
    private applicationService: ApplicationService,
    private emailService: EmailService,
  ) {}

  @Get()
  async getApplications(@Req() req) {
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
    let localGovernment: ApplicationLocalGovernment | null = null;

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

    if (validationResult.application) {
      const validatedApplicationSubmission = validationResult.application;
      if (validatedApplicationSubmission.typeCode === 'TURP') {
        await this.applicationSubmissionService.submitToAlcs(
          validatedApplicationSubmission,
          req.user.entity,
        );
        return await this.applicationSubmissionService.updateStatus(
          applicationSubmission,
          SUBMISSION_STATUS.SUBMITTED_TO_ALC,
        );
      } else {
        const wasSubmittedToLfng =
          applicationSubmission.submissionStatuses.find(
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
          const submittedLocalGovernment =
            await this.getSubmissionGovernmentOrFail(applicationSubmission);

          const primaryContact = applicationSubmission.owners.find(
            (owner) =>
              owner.uuid === applicationSubmission.primaryContactOwnerUuid,
          );

          if (primaryContact && primaryContact.email) {
            await this.sendStatusEmail(
              applicationSubmission,
              applicationSubmission.fileNumber,
              submittedLocalGovernment,
              primaryContact,
            );
          }

          if (applicationSubmission.localGovernmentUuid) {
            const submittedLocalGovernment =
              await this.localGovernmentService.getByUuid(
                applicationSubmission.localGovernmentUuid,
              );

            if (
              submittedLocalGovernment &&
              submittedLocalGovernment.emails.length > 0
            ) {
              await this.sendStatusGovEmail(
                applicationSubmission,
                applicationSubmission.fileNumber,
                submittedLocalGovernment,
              );
            }
          }
        }

        return await this.applicationSubmissionService.submitToLg(
          validatedApplicationSubmission,
        );
      }
    } else {
      this.logger.debug(validationResult.errors);
      throw new BadRequestException('Invalid Application');
    }
  }

  private async sendStatusEmail(
    applicationSubmission: ApplicationSubmission,
    fileNumber: string,
    submittedLocalGovernment: ApplicationLocalGovernment,
    primaryContact: ApplicationOwner,
  ) {
    // TODO: Refactor duplicated code from application-submission-review
    if (primaryContact.email) {
      const status = await this.applicationSubmissionService.getStatus(
        SUBMISSION_STATUS.SUBMITTED_TO_LG,
      );

      const types = await this.applicationService.fetchApplicationTypes();

      const matchingType = types.find(
        (type) => type.code === applicationSubmission.typeCode,
      );

      const emailTemplate = generateStatusApplicantHtml({
        fileNumber,
        applicantName: applicationSubmission.applicant || 'Unknown',
        applicationType:
          matchingType?.portalLabel ?? matchingType?.label ?? 'Unknown',
        governmentName: submittedLocalGovernment.name,
        status: status.label,
      });

      this.emailService.sendEmail({
        body: emailTemplate.html,
        subject: `Agricultural Land Commission Application ID: ${fileNumber} (${
          applicationSubmission.applicant || 'Unknown'
        })`,
        to: [primaryContact.email],
      });
    }
  }

  private async sendStatusGovEmail(
    applicationSubmission: ApplicationSubmission,
    fileNumber: string,
    submittedLocalGovernment: ApplicationLocalGovernment,
  ) {
    if (submittedLocalGovernment.emails.length > 0) {
      const status = await this.applicationSubmissionService.getStatus(
        SUBMISSION_STATUS.SUBMITTED_TO_LG,
      );

      const types = await this.applicationService.fetchApplicationTypes();

      const matchingType = types.find(
        (type) => type.code === applicationSubmission.typeCode,
      );

      const emailTemplate = generateStatusGovernmentHtml({
        fileNumber,
        applicantName: applicationSubmission.applicant || 'Unknown',
        applicationType:
          matchingType?.portalLabel ?? matchingType?.label ?? 'Unknown',
        governmentName: submittedLocalGovernment.name,
        status: status.label,
      });

      submittedLocalGovernment.emails.forEach((email) => {
        this.emailService.sendEmail({
          body: emailTemplate.html,
          subject: `Agricultural Land Commission Application ID: ${fileNumber} (${
            applicationSubmission.applicant || 'Unknown'
          })`,
          to: [email],
        });
      });
    }
  }

  private async getSubmissionGovernmentOrFail(
    submission: ApplicationSubmission,
  ) {
    const submissionGovernment = await this.getSubmissionGovernment(submission);
    if (!submissionGovernment) {
      throw new NotFoundException('Submission local government not found');
    }
    return submissionGovernment;
  }

  private async getSubmissionGovernment(submission: ApplicationSubmission) {
    if (submission.localGovernmentUuid) {
      const localGovernment = await this.localGovernmentService.getByUuid(
        submission.localGovernmentUuid,
      );
      if (localGovernment) {
        return localGovernment;
      }
    }
    return undefined;
  }
}
