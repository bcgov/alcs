import {
  BaseServiceException,
  ServiceNotFoundException,
} from '@app/common/exceptions/base.exception';
import {
  Body,
  Controller,
  Get,
  Logger,
  NotFoundException,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { generateStatusHtml } from '../../../../../templates/emails/submission-status.template';
import { ApplicationLocalGovernment } from '../../alcs/application/application-code/application-local-government/application-local-government.entity';
import { ApplicationLocalGovernmentService } from '../../alcs/application/application-code/application-local-government/application-local-government.service';
import { ApplicationDocumentService } from '../../alcs/application/application-document/application-document.service';
import { ApplicationService } from '../../alcs/application/application.service';
import { PortalAuthGuard } from '../../common/authorization/portal-auth-guard.service';
import { DOCUMENT_SOURCE } from '../../document/document.dto';
import { EmailService } from '../../providers/email/email.service';
import { User } from '../../user/user.entity';
import { ApplicationOwner } from '../application-submission/application-owner/application-owner.entity';
import { APPLICATION_STATUS } from '../application-submission/application-status/application-status.dto';
import { ApplicationSubmissionValidatorService } from '../application-submission/application-submission-validator.service';
import { ApplicationSubmission } from '../application-submission/application-submission.entity';
import { ApplicationSubmissionService } from '../application-submission/application-submission.service';
import {
  ReturnApplicationSubmissionDto,
  UpdateApplicationSubmissionReviewDto,
} from './application-submission-review.dto';
import { ApplicationSubmissionReviewService } from './application-submission-review.service';

@Controller('application-review')
@UseGuards(PortalAuthGuard)
export class ApplicationSubmissionReviewController {
  private logger: Logger = new Logger(
    ApplicationSubmissionReviewController.name,
  );

  constructor(
    private applicationSubmissionService: ApplicationSubmissionService,
    private applicationReviewService: ApplicationSubmissionReviewService,
    private applicationDocumentService: ApplicationDocumentService,
    private localGovernmentService: ApplicationLocalGovernmentService,
    private applicationValidatorService: ApplicationSubmissionValidatorService,
    private applicationService: ApplicationService,
    private emailService: EmailService,
  ) {}

  @Get('/:fileNumber')
  async get(@Param('fileNumber') fileNumber: string, @Req() req) {
    const userLocalGovernment = await this.getUserGovernment(req.user.entity);
    if (userLocalGovernment) {
      const applicationReview =
        await this.applicationReviewService.getForGovernment(
          fileNumber,
          userLocalGovernment,
        );

      if (applicationReview) {
        return this.applicationReviewService.mapToDto(
          applicationReview,
          userLocalGovernment,
        );
      }
    }

    const applicationReview = await this.applicationReviewService.getForOwner(
      fileNumber,
      req.user.entity,
    );

    if (!applicationReview.application.submittedApplication) {
      throw new NotFoundException(
        `Application submission not found for ${fileNumber}`,
      );
    }

    if (
      ![
        APPLICATION_STATUS.SUBMITTED_TO_ALC,
        APPLICATION_STATUS.REFUSED_TO_FORWARD,
      ].includes(
        applicationReview.application.submittedApplication
          .statusCode as APPLICATION_STATUS,
      )
    ) {
      throw new NotFoundException('Failed to load review');
    }

    const localGovernments = await this.localGovernmentService.list();
    const matchingGovernment = localGovernments.find(
      (lg) =>
        lg.uuid ===
        applicationReview.application.submittedApplication!.localGovernmentUuid,
    );
    if (!matchingGovernment) {
      throw new BaseServiceException('Failed to load Local Government');
    }

    return this.applicationReviewService.mapToDto(
      applicationReview,
      matchingGovernment,
    );
  }

  @Post('/:fileNumber')
  async update(
    @Param('fileNumber') fileNumber: string,
    @Req() req,
    @Body() updateDto: UpdateApplicationSubmissionReviewDto,
  ) {
    const userLocalGovernment = await this.getUserGovernmentOrFail(
      req.user.entity,
    );

    const applicationReview = await this.applicationReviewService.update(
      fileNumber,
      userLocalGovernment,
      updateDto,
    );

    return this.applicationReviewService.mapToDto(
      applicationReview,
      userLocalGovernment,
    );
  }

  @Post('/:fileNumber/start')
  async create(@Param('fileNumber') fileNumber: string, @Req() req) {
    const userLocalGovernment = await this.getUserGovernmentOrFail(
      req.user.entity,
    );

    const applicationSubmission =
      await this.applicationSubmissionService.getForGovernmentByFileId(
        fileNumber,
        userLocalGovernment,
      );

    const applicationReview = await this.applicationReviewService.startReview(
      applicationSubmission,
    );

    await this.applicationSubmissionService.updateStatus(
      applicationSubmission,
      APPLICATION_STATUS.IN_REVIEW,
    );

    const primaryContact = applicationSubmission.owners.find(
      (owner) => owner.uuid === applicationSubmission.primaryContactOwnerUuid,
    );

    if (primaryContact && primaryContact.email) {
      await this.sendStatusEmail(
        applicationSubmission,
        fileNumber,
        userLocalGovernment,
        primaryContact,
      );
    }

    return this.applicationReviewService.mapToDto(
      applicationReview,
      userLocalGovernment,
    );
  }

  private async sendStatusEmail(
    applicationSubmission: ApplicationSubmission,
    fileNumber: string,
    userLocalGovernment: ApplicationLocalGovernment,
    primaryContact: ApplicationOwner,
  ) {
    if (primaryContact.email) {
      const status = await this.applicationSubmissionService.getStatus(
        APPLICATION_STATUS.IN_REVIEW,
      );

      const types = await this.applicationService.fetchApplicationTypes();
      const matchingType = types.find(
        (type) => type.code === applicationSubmission.typeCode,
      );

      const emailTemplate = generateStatusHtml({
        fileNumber,
        applicantName: applicationSubmission.applicant || 'Unknown',
        applicationType:
          matchingType?.portalLabel ?? matchingType?.label ?? 'Unknown',
        governmentName: userLocalGovernment.name,
        status: status.label,
      });

      this.emailService.sendEmail({
        body: emailTemplate.html,
        subject: `Agricultural Land Commission Application ID: ${fileNumber} (${
          applicationSubmission.applicant || 'Unknown'
        })`,
        to: [primaryContact.email],
      });
    } else {
      this.logger.warn(
        'Cannot send status email, primary contact has no email',
      );
    }
  }

  @Post('/:fileNumber/finish')
  async finish(@Param('fileNumber') fileNumber: string, @Req() req) {
    const userLocalGovernment = await this.getUserGovernmentOrFail(
      req.user.entity,
    );

    const application =
      await this.applicationSubmissionService.getForGovernmentByFileId(
        fileNumber,
        userLocalGovernment,
      );

    const applicationReview =
      await this.applicationReviewService.getForGovernment(
        application.fileNumber,
        userLocalGovernment,
      );

    if (!applicationReview) {
      throw new ServiceNotFoundException('Failed to load application review');
    }

    const applicationDocuments = await this.applicationDocumentService.list(
      applicationReview.applicationFileNumber,
    );

    const completedReview = this.applicationReviewService.verifyComplete(
      applicationReview,
      applicationDocuments,
      userLocalGovernment.isFirstNation,
    );

    const validationResult =
      await this.applicationValidatorService.validateSubmission(application);

    if (!validationResult.application) {
      throw new BaseServiceException(
        `Invalid application found during LG Submission ${application.fileNumber}`,
      );
    }

    if (application.statusCode === APPLICATION_STATUS.IN_REVIEW) {
      await this.applicationSubmissionService.submitToAlcs(
        validationResult.application,
        req.user.entity,
        completedReview,
      );
      if (completedReview.isAuthorized !== false) {
        await this.applicationSubmissionService.updateStatus(
          application,
          APPLICATION_STATUS.SUBMITTED_TO_ALC,
        );
      } else {
        await this.applicationSubmissionService.updateStatus(
          application,
          APPLICATION_STATUS.REFUSED_TO_FORWARD,
        );
      }
    } else {
      throw new BaseServiceException('Application not in correct status');
    }
  }

  @Post('/:fileNumber/return')
  async return(
    @Param('fileNumber') fileNumber: string,
    @Req() req,
    @Body() returnDto: ReturnApplicationSubmissionDto,
  ) {
    const userLocalGovernment = await this.getUserGovernmentOrFail(
      req.user.entity,
    );

    const applicationSubmission =
      await this.applicationSubmissionService.getForGovernmentByFileId(
        fileNumber,
        userLocalGovernment,
      );

    const applicationReview =
      await this.applicationReviewService.getForGovernment(
        applicationSubmission.fileNumber,
        userLocalGovernment,
      );

    if (!applicationReview) {
      throw new ServiceNotFoundException('Failed to load application review');
    }

    if (applicationSubmission.statusCode === APPLICATION_STATUS.IN_REVIEW) {
      const documents = await this.applicationDocumentService.list(
        applicationSubmission.fileNumber,
      );
      const documentsToDelete = documents.filter(
        (document) => document.document.source === DOCUMENT_SOURCE.LFNG,
      );
      for (const document of documentsToDelete) {
        await this.applicationDocumentService.delete(document);
      }

      await this.applicationReviewService.delete(applicationReview);

      applicationSubmission.returnedComment = returnDto.applicantComment;
      if (returnDto.reasonForReturn === 'incomplete') {
        await this.applicationSubmissionService.updateStatus(
          applicationSubmission,
          APPLICATION_STATUS.INCOMPLETE,
        );
      } else {
        await this.applicationSubmissionService.updateStatus(
          applicationSubmission,
          APPLICATION_STATUS.WRONG_GOV,
        );
      }
    } else {
      throw new BaseServiceException('Application not in correct status');
    }
  }

  private async getUserGovernmentOrFail(user: User) {
    const userGovernment = await this.getUserGovernment(user);
    if (!userGovernment) {
      throw new NotFoundException('User not part of any local government');
    }
    return userGovernment;
  }

  private async getUserGovernment(user: User) {
    if (user.bceidBusinessGuid) {
      const localGovernment = await this.localGovernmentService.getByGuid(
        user.bceidBusinessGuid,
      );
      if (localGovernment) {
        return localGovernment;
      }
    }
    return undefined;
  }
}
