import {
  BaseServiceException,
  ServiceNotFoundException,
} from '@app/common/exceptions/base.exception';
import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { generateRFFGHtml } from '../../../../../templates/emails/refused-to-forward.template';
import { generateINCMHtml } from '../../../../../templates/emails/returned-as-incomplete.template';
import { generateSUBMApplicationHtml } from '../../../../../templates/emails/submitted-to-alc';
import { generateREVGHtml } from '../../../../../templates/emails/under-review-by-lfng.template';
import { generateWRNGHtml } from '../../../../../templates/emails/wrong-lfng.template';
import { ApplicationDocumentService } from '../../alcs/application/application-document/application-document.service';
import { ApplicationSubmissionStatusService } from '../../alcs/application/application-submission-status/application-submission-status.service';
import { SUBMISSION_STATUS } from '../../alcs/application/application-submission-status/submission-status.dto';
import { PARENT_TYPE } from '../../alcs/card/card-subtask/card-subtask.dto';
import { LocalGovernmentService } from '../../alcs/local-government/local-government.service';
import { PortalAuthGuard } from '../../common/authorization/portal-auth-guard.service';
import { OWNER_TYPE } from '../../common/owner-type/owner-type.entity';
import { DOCUMENT_SOURCE } from '../../document/document.dto';
import { StatusEmailService } from '../../providers/email/status-email.service';
import { User } from '../../user/user.entity';
import { ApplicationSubmissionValidatorService } from '../application-submission/application-submission-validator.service';
import { ApplicationSubmission } from '../application-submission/application-submission.entity';
import { ApplicationSubmissionService } from '../application-submission/application-submission.service';
import { APPLICATION_SUBMISSION_TYPES } from '../pdf-generation/generate-submission-document.service';
import {
  ReturnApplicationSubmissionDto,
  UpdateApplicationSubmissionReviewDto,
} from './application-submission-review.dto';
import { ApplicationSubmissionReviewService } from './application-submission-review.service';

@Controller('application-review')
@UseGuards(PortalAuthGuard)
export class ApplicationSubmissionReviewController {
  constructor(
    private applicationSubmissionService: ApplicationSubmissionService,
    private applicationSubmissionReviewService: ApplicationSubmissionReviewService,
    private applicationDocumentService: ApplicationDocumentService,
    private localGovernmentService: LocalGovernmentService,
    private applicationValidatorService: ApplicationSubmissionValidatorService,
    private statusEmailService: StatusEmailService,
    private applicationSubmissionStatusService: ApplicationSubmissionStatusService,
  ) {}

  @Get('/:fileNumber')
  async get(@Param('fileNumber') fileNumber: string, @Req() req) {
    const userLocalGovernment = await this.getUserGovernment(req.user.entity);
    if (userLocalGovernment) {
      const applicationSubmission =
        await this.applicationSubmissionService.getForGovernmentByFileId(
          fileNumber,
          userLocalGovernment,
        );

      if (!applicationSubmission) {
        throw new NotFoundException(
          `Application submission not found for ${fileNumber}`,
        );
      }

      const applicationReview =
        await this.applicationSubmissionReviewService.getByFileNumber(
          fileNumber,
        );

      if (
        applicationReview.createdBy &&
        applicationReview.createdBy.bceidBusinessGuid
      ) {
        const reviewGovernment = await this.localGovernmentService.getByGuid(
          applicationReview.createdBy.bceidBusinessGuid,
        );

        if (reviewGovernment) {
          return this.applicationSubmissionReviewService.mapToDto(
            applicationReview,
            reviewGovernment,
          );
        }
      }

      return this.applicationSubmissionReviewService.mapToDto(
        applicationReview,
        userLocalGovernment,
      );
    }

    const applicationReview =
      await this.applicationSubmissionReviewService.getByFileNumber(fileNumber);

    const applicationSubmission =
      await this.applicationSubmissionService.getByFileNumber(
        fileNumber,
        req.user.entity,
      );

    if (!applicationSubmission) {
      throw new NotFoundException(
        `Application submission not found for ${fileNumber}`,
      );
    }

    if (applicationSubmission.typeCode === APPLICATION_SUBMISSION_TYPES.TURP) {
      throw new NotFoundException('Not subject to review');
    }

    const localGovernments = await this.localGovernmentService.list();
    const matchingGovernment = localGovernments.find(
      (lg) => lg.uuid === applicationSubmission.localGovernmentUuid,
    );
    if (!matchingGovernment) {
      throw new BaseServiceException('Failed to load Local Government');
    }

    return this.applicationSubmissionReviewService.mapToDto(
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

    //Check they have access to the original submission
    const applicationSubmission =
      await this.applicationSubmissionService.getForGovernmentByFileId(
        fileNumber,
        userLocalGovernment,
      );

    if (!applicationSubmission) {
      throw new NotFoundException(
        `Application submission not found for ${fileNumber}`,
      );
    }

    const applicationReview =
      await this.applicationSubmissionReviewService.update(
        fileNumber,
        updateDto,
      );

    return this.applicationSubmissionReviewService.mapToDto(
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

    const applicationReview =
      await this.applicationSubmissionReviewService.startReview(
        applicationSubmission,
        req.user.entity,
      );

    await this.applicationSubmissionService.updateStatus(
      applicationSubmission,
      SUBMISSION_STATUS.IN_REVIEW_BY_LG,
    );

    const primaryContact = applicationSubmission.owners?.find(
      (owner) => owner.uuid === applicationSubmission.primaryContactOwnerUuid,
    );

    if (primaryContact) {
      await this.statusEmailService.sendApplicationStatusEmail({
        generateStatusHtml: generateREVGHtml,
        status: SUBMISSION_STATUS.IN_REVIEW_BY_LG,
        applicationSubmission,
        government: userLocalGovernment,
        parentType: PARENT_TYPE.APPLICATION,
        primaryContact,
      });
    }

    const creatingGuid = applicationSubmission.createdBy.bceidBusinessGuid;
    const creatingGovernment = await this.localGovernmentService.getByGuid(
      creatingGuid!,
    );

    if (
      creatingGovernment?.uuid === applicationSubmission.localGovernmentUuid &&
      primaryContact &&
      primaryContact.type.code === OWNER_TYPE.GOVERNMENT
    ) {
      //Copy contact details over to government form when applying to self
      await this.applicationSubmissionReviewService.update(
        applicationSubmission.fileNumber,
        {
          firstName: primaryContact.firstName,
          lastName: primaryContact.lastName,
          email: primaryContact.email,
          department: primaryContact.organizationName,
          phoneNumber: primaryContact.phoneNumber,
        },
      );
    }

    return this.applicationSubmissionReviewService.mapToDto(
      applicationReview,
      userLocalGovernment,
    );
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
      await this.applicationSubmissionReviewService.getByFileNumber(
        application.fileNumber,
      );

    if (!applicationReview) {
      throw new ServiceNotFoundException('Failed to load application review');
    }

    const applicationDocuments = await this.applicationDocumentService.list(
      applicationReview.applicationFileNumber,
    );

    const completedReview =
      this.applicationSubmissionReviewService.verifyComplete(
        applicationReview,
        applicationDocuments,
        userLocalGovernment.isFirstNation,
      );

    const validationResult =
      await this.applicationValidatorService.validateSubmission(application);

    if (!validationResult.submission) {
      throw new BaseServiceException(
        `Invalid application found during LG Submission ${
          application.fileNumber
        } ${validationResult.errors.toString()}`,
      );
    }

    if (
      application.status.statusTypeCode === SUBMISSION_STATUS.IN_REVIEW_BY_LG
    ) {
      await this.applicationSubmissionService.submitToAlcs(
        validationResult.submission,
        req.user.entity,
        completedReview,
      );

      const primaryContact = application.owners?.find(
        (owner) => owner.uuid === application.primaryContactOwnerUuid,
      );

      if (completedReview.isAuthorized !== false) {
        await this.applicationSubmissionService.updateStatus(
          application,
          SUBMISSION_STATUS.SUBMITTED_TO_ALC,
        );

        if (primaryContact) {
          await this.statusEmailService.sendApplicationStatusEmail({
            generateStatusHtml: generateSUBMApplicationHtml,
            status: SUBMISSION_STATUS.SUBMITTED_TO_ALC,
            applicationSubmission: application,
            government: userLocalGovernment,
            parentType: PARENT_TYPE.APPLICATION,
            primaryContact,
            ccGovernment: true,
          });
        }
      } else {
        await this.applicationSubmissionService.updateStatus(
          application,
          SUBMISSION_STATUS.REFUSED_TO_FORWARD_LG,
        );

        if (primaryContact) {
          await this.statusEmailService.sendApplicationStatusEmail({
            generateStatusHtml: generateRFFGHtml,
            status: SUBMISSION_STATUS.REFUSED_TO_FORWARD_LG,
            applicationSubmission: application,
            government: userLocalGovernment,
            parentType: PARENT_TYPE.APPLICATION,
            primaryContact,
            ccGovernment: true,
          });
        }
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
      await this.applicationSubmissionReviewService.getByFileNumber(
        applicationSubmission.fileNumber,
      );

    if (!applicationReview) {
      throw new ServiceNotFoundException('Failed to load application review');
    }

    if (
      applicationSubmission.status.statusTypeCode ===
      SUBMISSION_STATUS.IN_REVIEW_BY_LG
    ) {
      const documents = await this.applicationDocumentService.list(
        applicationSubmission.fileNumber,
      );
      const documentsToDelete = documents.filter(
        (document) => document.document.source === DOCUMENT_SOURCE.LFNG,
      );
      for (const document of documentsToDelete) {
        await this.applicationDocumentService.delete(document);
      }

      await this.applicationSubmissionReviewService.delete(applicationReview);

      await this.applicationSubmissionStatusService.setStatusDate(
        applicationSubmission.uuid,
        SUBMISSION_STATUS.SUBMITTED_TO_LG,
        null,
      );

      await this.applicationSubmissionStatusService.setStatusDate(
        applicationSubmission.uuid,
        SUBMISSION_STATUS.IN_REVIEW_BY_LG,
        null,
      );

      if (returnDto.applicantComment) {
        await this.applicationSubmissionService.update(
          applicationSubmission.uuid,
          {
            returnedComment: returnDto.applicantComment,
          },
        );
      }

      await this.setReturnedStatus(returnDto, applicationSubmission);

      const primaryContact = applicationSubmission.owners?.find(
        (owner) => owner.uuid === applicationSubmission.primaryContactOwnerUuid,
      );

      if (primaryContact) {
        if (returnDto.reasonForReturn === 'wrongGovernment') {
          await this.statusEmailService.sendApplicationStatusEmail({
            generateStatusHtml: generateWRNGHtml,
            status: SUBMISSION_STATUS.WRONG_GOV,
            applicationSubmission,
            government: userLocalGovernment,
            parentType: PARENT_TYPE.APPLICATION,
            primaryContact,
          });
        }

        if (returnDto.reasonForReturn === 'incomplete') {
          await this.statusEmailService.sendApplicationStatusEmail({
            generateStatusHtml: generateINCMHtml,
            status: SUBMISSION_STATUS.INCOMPLETE,
            applicationSubmission,
            government: userLocalGovernment,
            parentType: PARENT_TYPE.APPLICATION,
            primaryContact,
            ccGovernment: true,
          });
        }
      }
    } else {
      throw new BaseServiceException('Application not in correct status');
    }
  }

  private async setReturnedStatus(
    returnDto: ReturnApplicationSubmissionDto,
    applicationSubmission: ApplicationSubmission,
  ) {
    if (returnDto.reasonForReturn === 'incomplete') {
      await this.applicationSubmissionService.updateStatus(
        applicationSubmission,
        SUBMISSION_STATUS.WRONG_GOV,
        null,
      );
      await this.applicationSubmissionService.updateStatus(
        applicationSubmission,
        SUBMISSION_STATUS.INCOMPLETE,
      );
    } else {
      await this.applicationSubmissionService.updateStatus(
        applicationSubmission,
        SUBMISSION_STATUS.INCOMPLETE,
        null,
      );
      await this.applicationSubmissionService.updateStatus(
        applicationSubmission,
        SUBMISSION_STATUS.WRONG_GOV,
      );
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
