import { ServiceValidationException } from '@app/common/exceptions/base.exception';
import { Injectable, Logger } from '@nestjs/common';
import { LocalGovernmentService } from '../../alcs/local-government/local-government.service';
import { NotificationDocument } from '../../alcs/notification/notification-document/notification-document.entity';
import { NotificationDocumentService } from '../../alcs/notification/notification-document/notification-document.service';
import { DOCUMENT_TYPE } from '../../document/document-code.entity';
import { NotificationParcelService } from './notification-parcel/notification-parcel.service';
import { NotificationSubmission } from './notification-submission.entity';

export class ValidatedNotificationSubmission extends NotificationSubmission {
  applicant: string;
  localGovernmentUuid: string;
}

@Injectable()
export class NotificationSubmissionValidatorService {
  private logger: Logger = new Logger(
    NotificationSubmissionValidatorService.name,
  );

  constructor(
    private localGovernmentService: LocalGovernmentService,
    private notificationParcelService: NotificationParcelService,
    private notificationDocumentService: NotificationDocumentService,
  ) {}

  async validateSubmission(notificationSubmission: NotificationSubmission) {
    const errors: Error[] = [];

    if (!notificationSubmission.applicant) {
      errors.push(new ServiceValidationException('Missing applicant'));
    }

    if (!notificationSubmission.purpose) {
      errors.push(new ServiceValidationException('Missing purpose'));
    }

    await this.validateParcels(notificationSubmission, errors);

    const applicantDocuments =
      await this.notificationDocumentService.getApplicantDocuments(
        notificationSubmission.fileNumber,
      );

    await this.validatePrimaryContact(notificationSubmission, errors);

    await this.validateLocalGovernment(notificationSubmission, errors);
    await this.validateProposal(
      notificationSubmission,
      applicantDocuments,
      errors,
    );
    await this.validateOptionalDocuments(applicantDocuments, errors);

    return {
      errors,
      noticeOfIntentSubmission:
        errors.length === 0
          ? (notificationSubmission as ValidatedNotificationSubmission)
          : undefined,
    };
  }

  private async validateParcels(
    notificationSubmission: NotificationSubmission,
    errors: Error[],
  ) {
    const parcels = await this.notificationParcelService.fetchByFileId(
      notificationSubmission.fileNumber,
    );

    if (parcels.length === 0) {
      errors.push(
        new ServiceValidationException(`Notification has no parcels`),
      );
    }

    for (const parcel of parcels) {
      if (
        parcel.ownershipTypeCode === null ||
        parcel.legalDescription === null ||
        parcel.mapAreaHectares === null ||
        parcel.civicAddress === null
      ) {
        errors.push(
          new ServiceValidationException(`Invalid Parcel ${parcel.uuid}`),
        );
      }

      if (parcel.ownershipTypeCode === 'SMPL' && !parcel.pid) {
        errors.push(
          new ServiceValidationException(
            `Fee Simple Parcel ${parcel.uuid} has no PID`,
          ),
        );
      }

      if (parcel.pid && parcel.pid.length !== 9) {
        errors.push(
          new ServiceValidationException(
            `Parcel ${parcel.uuid} has invalid PID`,
          ),
        );
      }
    }

    if (errors.length === 0) {
      return parcels;
    }
  }

  private async validatePrimaryContact(
    notificationSubmission: NotificationSubmission,
    errors: Error[],
  ) {
    if (
      !notificationSubmission.contactFirstName ||
      !notificationSubmission.contactLastName ||
      !notificationSubmission.contactPhone ||
      !notificationSubmission.contactEmail
    ) {
      errors.push(
        new ServiceValidationException(`Invalid Primary Contact Information`),
      );
    }
  }

  private async validateLocalGovernment(
    notificationSubmission: NotificationSubmission,
    errors: Error[],
  ) {
    const localGovernments = await this.localGovernmentService.list();
    const matchingLg = localGovernments.find(
      (lg) => lg.uuid === notificationSubmission.localGovernmentUuid,
    );
    if (!notificationSubmission.localGovernmentUuid) {
      errors.push(
        new ServiceValidationException('Notification has no local government'),
      );
    }

    if (!matchingLg) {
      errors.push(
        new ServiceValidationException(
          'Cannot find local government set on Notification',
        ),
      );
      return;
    }

    if (!matchingLg.bceidBusinessGuid) {
      errors.push(
        new ServiceValidationException(
          `Selected local government is setup in portal ${matchingLg.name}`,
        ),
      );
    }
  }

  private async validateOptionalDocuments(
    applicantDocuments: NotificationDocument[],
    errors: Error[],
  ) {
    const untypedDocuments = applicantDocuments.filter(
      (document) => !document.type,
    );
    for (const document of untypedDocuments) {
      errors.push(
        new ServiceValidationException(
          `Document ${document.uuid} missing type`,
        ),
      );
    }

    const optionalDocuments = applicantDocuments.filter((document) =>
      [
        DOCUMENT_TYPE.OTHER,
        DOCUMENT_TYPE.PHOTOGRAPH,
        DOCUMENT_TYPE.PROFESSIONAL_REPORT,
      ].includes(document.type?.code as DOCUMENT_TYPE),
    );
    for (const document of optionalDocuments) {
      if (!document.description) {
        errors.push(
          new ServiceValidationException(
            `Document ${document.uuid} missing description`,
          ),
        );
      }
    }
  }

  private validateProposal(
    notificationSubmission: NotificationSubmission,
    applicantDocuments: NotificationDocument[],
    errors: Error[],
  ) {
    if (
      !notificationSubmission.submittersFileNumber ||
      !notificationSubmission.purpose ||
      !notificationSubmission.totalArea ||
      notificationSubmission.hasSurveyPlan === null
    ) {
      errors.push(
        new ServiceValidationException(`Incomplete Proposal Information`),
      );
    }

    const srwTerms = applicantDocuments.filter(
      (document) => document.type?.code === DOCUMENT_TYPE.SRW_TERMS,
    );
    if (srwTerms.length === 0) {
      errors.push(
        new ServiceValidationException(
          `${notificationSubmission.typeCode} proposal missing SRW Terms`,
        ),
      );
    }

    if (notificationSubmission.hasSurveyPlan) {
      const surveyPlans = applicantDocuments.filter(
        (document) => document.type?.code === DOCUMENT_TYPE.SURVEY_PLAN,
      );
      if (surveyPlans.length === 0) {
        errors.push(
          new ServiceValidationException(
            `${notificationSubmission.typeCode} proposal missing Survey Plans`,
          ),
        );
      }

      for (const plan of surveyPlans) {
        if (!plan.surveyPlanNumber || !plan.controlNumber) {
          errors.push(
            new ServiceValidationException(
              `${notificationSubmission.typeCode} proposal has survey plans missing survey/control plan numbers`,
            ),
          );
        }
      }
    }
  }
}
