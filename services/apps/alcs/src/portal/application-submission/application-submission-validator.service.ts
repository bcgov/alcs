import { ServiceValidationException } from '@app/common/exceptions/base.exception';
import { Injectable, Logger } from '@nestjs/common';
import { ApplicationLocalGovernmentService } from '../../alcs/application/application-code/application-local-government/application-local-government.service';
import {
  ApplicationDocument,
  DOCUMENT_TYPE,
} from '../../alcs/application/application-document/application-document.entity';
import { ApplicationDocumentService } from '../../alcs/application/application-document/application-document.service';
import { APPLICATION_OWNER } from './application-owner/application-owner.dto';
import { ApplicationOwner } from './application-owner/application-owner.entity';
import { PARCEL_TYPE } from './application-parcel/application-parcel.dto';
import { ApplicationParcel } from './application-parcel/application-parcel.entity';
import { ApplicationParcelService } from './application-parcel/application-parcel.service';
import { ApplicationSubmission } from './application-submission.entity';

export class ValidatedApplicationSubmission extends ApplicationSubmission {
  applicant: string;
  localGovernmentUuid: string;
  parcels: ApplicationParcel[];
  otherParcels: ApplicationParcel[];
  primaryContact: ApplicationOwner;
  parcelsAgricultureDescription: string;
  parcelsAgricultureImprovementDescription: string;
  parcelsNonAgricultureUseDescription: string;
  northLandUseType: string;
  northLandUseTypeDescription: string;
  eastLandUseType: string;
  eastLandUseTypeDescription: string;
  southLandUseType: string;
  southLandUseTypeDescription: string;
  westLandUseType: string;
  westLandUseTypeDescription: string;
  nfuHectares: number | null;
  nfuPurpose: string | null;
  nfuOutsideLands: string | null;
  nfuAgricultureSupport: string | null;
  nfuWillImportFill: boolean | null;
  nfuTotalFillPlacement: number | null;
  nfuMaxFillDepth: number | null;
  nfuFillVolume: number | null;
  nfuProjectDurationAmount: number | null;
  nfuProjectDurationUnit: string | null;
  nfuFillTypeDescription: string | null;
  nfuFillOriginDescription: string | null;
}

@Injectable()
export class ApplicationSubmissionValidatorService {
  private logger: Logger = new Logger(
    ApplicationSubmissionValidatorService.name,
  );

  constructor(
    private localGovernmentService: ApplicationLocalGovernmentService,
    private appParcelService: ApplicationParcelService,
    private appDocumentService: ApplicationDocumentService,
  ) {}

  async validateSubmission(applicationSubmission: ApplicationSubmission) {
    const errors: Error[] = [];

    if (!applicationSubmission.applicant) {
      errors.push(new ServiceValidationException('Missing applicant'));
    }

    const validatedParcels = await this.validateParcels(
      applicationSubmission,
      errors,
    );

    const applicationDocuments =
      await this.appDocumentService.getApplicantDocuments(
        applicationSubmission.fileNumber,
      );

    const validatedPrimaryContact = await this.validatePrimaryContact(
      applicationSubmission,
      applicationDocuments,
      errors,
    );
    await this.validateLocalGovernment(applicationSubmission, errors);
    await this.validateLandUse(applicationSubmission, errors);
    await this.validateOptionalDocuments(applicationDocuments, errors);

    if (applicationSubmission.typeCode === 'NFUP') {
      await this.validateNfuProposal(applicationSubmission, errors);
    }
    if (applicationSubmission.typeCode === 'TURP') {
      await this.validateTurProposal(applicationSubmission, errors);
    }

    const validatedApplication =
      validatedParcels && validatedPrimaryContact
        ? ({
            ...applicationSubmission,
            primaryContact: validatedPrimaryContact,
            parcels: validatedParcels.filter(
              (parcel) => parcel.parcelType === PARCEL_TYPE.APPLICATION,
            ),
            otherParcels: validatedParcels.filter(
              (parcel) => parcel.parcelType === PARCEL_TYPE.OTHER,
            ),
          } as ValidatedApplicationSubmission)
        : undefined;

    return {
      errors,
      application: errors.length === 0 ? validatedApplication : undefined,
    };
  }

  private async validateParcels(
    application: ApplicationSubmission,
    errors: Error[],
  ) {
    const parcels = await this.appParcelService.fetchByApplicationFileId(
      application.fileNumber,
    );

    if (parcels.length === 0) {
      errors.push(new ServiceValidationException(`Application has no parcels`));
    }

    if (application.hasOtherParcelsInCommunity === null) {
      errors.push(
        new ServiceValidationException(`Not answered has Other Parcels`),
      );
    }

    for (const parcel of parcels) {
      if (
        parcel.ownershipTypeCode === null ||
        parcel.legalDescription === null ||
        parcel.mapAreaHectares === null ||
        parcel.isFarm === null ||
        (!parcel.isConfirmedByApplicant &&
          parcel.parcelType === PARCEL_TYPE.APPLICATION)
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

      if (parcel.ownershipTypeCode === 'SMPL' && !parcel.purchasedDate) {
        errors.push(
          new ServiceValidationException(
            `Fee Simple Parcel ${parcel.uuid} has no purchase date`,
          ),
        );
      }

      if (parcel.ownershipTypeCode === 'CRWN' && !parcel.crownLandOwnerType) {
        errors.push(
          new ServiceValidationException(
            `Crown Parcel ${parcel.uuid} has no ownership type`,
          ),
        );
      }

      if (parcel.owners.length === 0) {
        errors.push(
          new ServiceValidationException(`Parcel has no Owners ${parcel.uuid}`),
        );
      }

      if (
        parcel.parcelType === PARCEL_TYPE.APPLICATION &&
        parcel.documents.length === 0 &&
        (parcel.ownershipTypeCode === 'SMPL' || parcel.pid)
      ) {
        errors.push(
          new ServiceValidationException(
            `Parcel is missing certificate of title ${parcel.uuid}`,
          ),
        );
      }
    }

    if (errors.length === 0) {
      return parcels;
    }
  }

  private async validatePrimaryContact(
    applicationSubmission: ApplicationSubmission,
    documents: ApplicationDocument[],
    errors: Error[],
  ): Promise<ApplicationOwner | undefined> {
    const primaryOwner = applicationSubmission.owners.find(
      (owner) => owner.uuid === applicationSubmission.primaryContactOwnerUuid,
    );

    if (!primaryOwner) {
      errors.push(
        new ServiceValidationException(`Application has no primary contact`),
      );
      return;
    }

    const hasCrownLandOwners = applicationSubmission.owners.some(
      (owner) => owner.type.code === APPLICATION_OWNER.CROWN,
    );
    if (applicationSubmission.owners.length > 1 || hasCrownLandOwners) {
      const authorizationLetters = documents.filter(
        (document) => document.type === DOCUMENT_TYPE.AUTHORIZATION_LETTER,
      );
      if (authorizationLetters.length === 0) {
        errors.push(
          new ServiceValidationException(
            `Application has no authorization letters`,
          ),
        );
      }
    }

    if (primaryOwner.type.code === APPLICATION_OWNER.AGENT) {
      if (
        !primaryOwner.firstName ||
        !primaryOwner.lastName ||
        !primaryOwner.phoneNumber ||
        !primaryOwner.email
      ) {
        errors.push(
          new ServiceValidationException(
            `Invalid Third Party Agent Information`,
          ),
        );
      }
    }

    if (errors.length === 0) {
      return primaryOwner;
    }
    return undefined;
  }

  private async validateLocalGovernment(
    application: ApplicationSubmission,
    errors: Error[],
  ) {
    const localGovernments = await this.localGovernmentService.list();
    const matchingLg = localGovernments.find(
      (lg) => lg.uuid === application.localGovernmentUuid,
    );
    if (!application.localGovernmentUuid) {
      errors.push(
        new ServiceValidationException('Application has no local government'),
      );
    }

    if (!matchingLg) {
      errors.push(
        new ServiceValidationException(
          'Cannot find local government set on Application',
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

  private async validateLandUse(
    application: ApplicationSubmission,
    errors: Error[],
  ) {
    if (
      !application.parcelsAgricultureDescription ||
      !application.parcelsAgricultureImprovementDescription ||
      !application.parcelsNonAgricultureUseDescription
    ) {
      errors.push(new ServiceValidationException(`Invalid Parcel Description`));
    }

    if (
      !application.northLandUseType ||
      !application.northLandUseTypeDescription ||
      !application.eastLandUseType ||
      !application.eastLandUseTypeDescription ||
      !application.southLandUseType ||
      !application.southLandUseTypeDescription ||
      !application.westLandUseType ||
      !application.westLandUseTypeDescription
    ) {
      errors.push(new ServiceValidationException(`Invalid Adjacent Parcels`));
    }
  }

  private async validateOptionalDocuments(
    documents: ApplicationDocument[],
    errors: Error[],
  ) {
    const untypedDocuments = documents.filter((document) => !document.type);
    for (const document of untypedDocuments) {
      errors.push(
        new ServiceValidationException(
          `Document ${document.uuid} missing type`,
        ),
      );
    }

    const optionalDocuments = documents.filter((document) =>
      [
        DOCUMENT_TYPE.OTHER,
        DOCUMENT_TYPE.PHOTOGRAPH,
        DOCUMENT_TYPE.PROFESSIONAL_REPORT,
      ].includes(document.type as DOCUMENT_TYPE),
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

  private async validateNfuProposal(
    application: ApplicationSubmission,
    errors: Error[],
  ) {
    if (
      !application.nfuHectares ||
      !application.nfuPurpose ||
      !application.nfuOutsideLands ||
      !application.nfuAgricultureSupport ||
      application.nfuWillImportFill === null
    ) {
      errors.push(new ServiceValidationException(`NFU Proposal incomplete`));
    }

    if (application.nfuWillImportFill) {
      if (
        !application.nfuFillTypeDescription ||
        !application.nfuFillOriginDescription ||
        application.nfuTotalFillPlacement === null ||
        application.nfuMaxFillDepth === null ||
        application.nfuFillVolume === null ||
        application.nfuProjectDurationAmount === null ||
        !application.nfuProjectDurationUnit
      ) {
        errors.push(
          new ServiceValidationException(`NFU Fill Section incomplete`),
        );
      }
    }
  }

  private async validateTurProposal(
    application: ApplicationSubmission,
    errors: Error[],
  ) {
    if (
      !application.turPurpose ||
      !application.turOutsideLands ||
      !application.turAgriculturalActivities ||
      !application.turReduceNegativeImpacts ||
      application.turTotalCorridorArea === null ||
      !application.turAllOwnersNotified
    ) {
      errors.push(new ServiceValidationException(`TUR Proposal incomplete`));
    }
  }
}
