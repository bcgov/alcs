import { ServiceValidationException } from '@app/common/exceptions/base.exception';
import { Injectable, Logger } from '@nestjs/common';
import { ApplicationLocalGovernmentService } from '../../alcs/application/application-code/application-local-government/application-local-government.service';
import { DOCUMENT_TYPE } from '../../alcs/application/application-document/application-document-code.entity';
import { ApplicationDocument } from '../../alcs/application/application-document/application-document.entity';
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

    const applicantDocuments =
      await this.appDocumentService.getApplicantDocuments(
        applicationSubmission.fileNumber,
      );

    const validatedPrimaryContact = await this.validatePrimaryContact(
      applicationSubmission,
      applicantDocuments,
      errors,
    );
    await this.validateLocalGovernment(applicationSubmission, errors);
    await this.validateLandUse(applicationSubmission, errors);
    await this.validateOptionalDocuments(applicantDocuments, errors);

    if (applicationSubmission.typeCode === 'NFUP') {
      await this.validateNfuProposal(applicationSubmission, errors);
    }
    if (applicationSubmission.typeCode === 'TURP') {
      await this.validateTurProposal(applicationSubmission, errors);
    }
    if (applicationSubmission.typeCode === 'SUBD') {
      await this.validateSubdProposal(
        applicationSubmission,
        applicantDocuments,
        errors,
      );
    }
    if (applicationSubmission.typeCode === 'ROSO') {
      await this.validateRosoProposal(
        applicationSubmission,
        applicantDocuments,
        errors,
      );
    }
    if (applicationSubmission.typeCode === 'POFO') {
      await this.validatePofoProposal(
        applicationSubmission,
        applicantDocuments,
        errors,
      );
    }
    if (applicationSubmission.typeCode === 'PFRS') {
      await this.validatePofoProposal(
        applicationSubmission,
        applicantDocuments,
        errors,
      );
      await this.validateRosoProposal(
        applicationSubmission,
        applicantDocuments,
        errors,
      );
      await this.validatePfrsProposal(
        applicationSubmission,
        applicantDocuments,
        errors,
      );
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
    applicationSubmission: ApplicationSubmission,
    errors: Error[],
  ) {
    const parcels = await this.appParcelService.fetchByApplicationFileId(
      applicationSubmission.fileNumber,
    );

    if (parcels.length === 0) {
      errors.push(new ServiceValidationException(`Application has no parcels`));
    }

    if (applicationSubmission.hasOtherParcelsInCommunity === null) {
      errors.push(
        new ServiceValidationException(`Not answered has Other Parcels`),
      );
    }

    for (const parcel of parcels) {
      if (
        parcel.ownershipTypeCode === null ||
        parcel.legalDescription === null ||
        parcel.mapAreaHectares === null ||
        parcel.civicAddress === null ||
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
        !parcel.certificateOfTitle &&
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

    const onlyHasIndividualOwner =
      applicationSubmission.owners.length === 1 &&
      applicationSubmission.owners[0].type.code ===
        APPLICATION_OWNER.INDIVIDUAL;

    if (!onlyHasIndividualOwner) {
      const authorizationLetters = documents.filter(
        (document) =>
          document.type?.code === DOCUMENT_TYPE.AUTHORIZATION_LETTER,
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
    applicationSubmission: ApplicationSubmission,
    errors: Error[],
  ) {
    const localGovernments = await this.localGovernmentService.list();
    const matchingLg = localGovernments.find(
      (lg) => lg.uuid === applicationSubmission.localGovernmentUuid,
    );
    if (!applicationSubmission.localGovernmentUuid) {
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
    applicationSubmission: ApplicationSubmission,
    errors: Error[],
  ) {
    if (
      !applicationSubmission.parcelsAgricultureDescription ||
      !applicationSubmission.parcelsAgricultureImprovementDescription ||
      !applicationSubmission.parcelsNonAgricultureUseDescription
    ) {
      errors.push(new ServiceValidationException(`Invalid Parcel Description`));
    }

    if (
      !applicationSubmission.northLandUseType ||
      !applicationSubmission.northLandUseTypeDescription ||
      !applicationSubmission.eastLandUseType ||
      !applicationSubmission.eastLandUseTypeDescription ||
      !applicationSubmission.southLandUseType ||
      !applicationSubmission.southLandUseTypeDescription ||
      !applicationSubmission.westLandUseType ||
      !applicationSubmission.westLandUseTypeDescription
    ) {
      errors.push(new ServiceValidationException(`Invalid Adjacent Parcels`));
    }
  }

  private async validateOptionalDocuments(
    applicantDocuments: ApplicationDocument[],
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

  private async validateNfuProposal(
    applicationSubmission: ApplicationSubmission,
    errors: Error[],
  ) {
    if (
      !applicationSubmission.nfuHectares ||
      !applicationSubmission.nfuPurpose ||
      !applicationSubmission.nfuOutsideLands ||
      !applicationSubmission.nfuAgricultureSupport ||
      applicationSubmission.nfuWillImportFill === null
    ) {
      errors.push(new ServiceValidationException(`NFU Proposal incomplete`));
    }

    if (applicationSubmission.nfuWillImportFill) {
      if (
        !applicationSubmission.nfuFillTypeDescription ||
        !applicationSubmission.nfuFillOriginDescription ||
        applicationSubmission.nfuTotalFillPlacement === null ||
        applicationSubmission.nfuMaxFillDepth === null ||
        applicationSubmission.nfuFillVolume === null ||
        applicationSubmission.nfuProjectDurationAmount === null ||
        !applicationSubmission.nfuProjectDurationUnit
      ) {
        errors.push(
          new ServiceValidationException(`NFU Fill Section incomplete`),
        );
      }
    }
  }

  private async validateTurProposal(
    applicationSubmission: ApplicationSubmission,
    errors: Error[],
  ) {
    if (
      !applicationSubmission.turPurpose ||
      !applicationSubmission.turOutsideLands ||
      !applicationSubmission.turAgriculturalActivities ||
      !applicationSubmission.turReduceNegativeImpacts ||
      applicationSubmission.turTotalCorridorArea === null ||
      !applicationSubmission.turAllOwnersNotified
    ) {
      errors.push(new ServiceValidationException(`TUR Proposal incomplete`));
    }
  }

  private async validateSubdProposal(
    applicationSubmission: ApplicationSubmission,
    applicantDocuments: ApplicationDocument[],
    errors: Error[],
  ) {
    if (applicationSubmission.subdProposedLots.length === 0) {
      errors.push(
        new ServiceValidationException(`SUBD application has no proposed lots`),
      );
    }
    if (
      !applicationSubmission.subdPurpose ||
      !applicationSubmission.subdSuitability ||
      !applicationSubmission.subdAgricultureSupport
    ) {
      errors.push(
        new ServiceValidationException(`SUBD application is not complete`),
      );
    }

    if (applicationSubmission.subdIsHomeSiteSeverance === null) {
      errors.push(
        new ServiceValidationException(
          `SUBD did not declare homesite severance`,
        ),
      );
    }

    if (applicationSubmission.subdIsHomeSiteSeverance) {
      const homesiteDocuments = applicantDocuments.filter(
        (document) => document.typeCode === DOCUMENT_TYPE.HOMESITE_SEVERANCE,
      );
      if (homesiteDocuments.length === 0) {
        errors.push(
          new ServiceValidationException(
            `SUBD delcared homesite severance but does not have required document`,
          ),
        );
      }
    }
  }

  private async validateRosoProposal(
    applicationSubmission: ApplicationSubmission,
    applicantDocuments: ApplicationDocument[],
    errors: Error[],
  ) {
    if (
      applicationSubmission.soilPurpose === null ||
      applicationSubmission.soilTypeRemoved === null ||
      applicationSubmission.soilReduceNegativeImpacts === null
    ) {
      errors.push(
        new ServiceValidationException(
          `${applicationSubmission.typeCode} Proposal incomplete`,
        ),
      );
    }

    if (
      applicationSubmission.soilTypeRemoved === null ||
      applicationSubmission.soilToRemoveVolume === null ||
      applicationSubmission.soilToRemoveArea === null ||
      applicationSubmission.soilToRemoveMaximumDepth === null ||
      applicationSubmission.soilToRemoveAverageDepth === null ||
      applicationSubmission.soilAlreadyRemovedVolume === null ||
      applicationSubmission.soilAlreadyRemovedArea === null ||
      applicationSubmission.soilAlreadyRemovedMaximumDepth === null ||
      applicationSubmission.soilAlreadyRemovedAverageDepth === null
    ) {
      errors.push(
        new ServiceValidationException(
          `${applicationSubmission.typeCode} Soil Table Incomplete`,
        ),
      );
    }
    this.runSharedSoilValidation(
      applicationSubmission,
      errors,
      applicantDocuments,
    );
  }

  private async validatePofoProposal(
    applicationSubmission: ApplicationSubmission,
    applicantDocuments: ApplicationDocument[],
    errors: Error[],
  ) {
    if (
      applicationSubmission.soilPurpose === null ||
      applicationSubmission.soilFillTypeToPlace === null ||
      applicationSubmission.soilAlternativeMeasures === null ||
      applicationSubmission.soilReduceNegativeImpacts === null
    ) {
      errors.push(
        new ServiceValidationException(
          `${applicationSubmission.typeCode} Proposal incomplete`,
        ),
      );
    }

    this.runSharedSoilValidation(
      applicationSubmission,
      errors,
      applicantDocuments,
    );

    if (
      applicationSubmission.soilToPlaceVolume === null ||
      applicationSubmission.soilToPlaceArea === null ||
      applicationSubmission.soilToPlaceMaximumDepth === null ||
      applicationSubmission.soilToPlaceAverageDepth === null ||
      applicationSubmission.soilAlreadyPlacedVolume === null ||
      applicationSubmission.soilAlreadyPlacedArea === null ||
      applicationSubmission.soilAlreadyPlacedMaximumDepth === null ||
      applicationSubmission.soilAlreadyPlacedAverageDepth === null
    ) {
      errors.push(
        new ServiceValidationException(
          `${applicationSubmission.typeCode} Soil Table Incomplete`,
        ),
      );
    }
    this.runSharedSoilValidation(
      applicationSubmission,
      errors,
      applicantDocuments,
    );
  }

  private runSharedSoilValidation(
    applicationSubmission: ApplicationSubmission,
    errors: Error[],
    applicantDocuments: ApplicationDocument[],
  ) {
    if (
      applicationSubmission.soilIsNOIFollowUp === null ||
      applicationSubmission.soilHasPreviousALCAuthorization === null ||
      !applicationSubmission.soilPurpose ||
      applicationSubmission.soilReduceNegativeImpacts === null
    ) {
      errors.push(
        new ServiceValidationException(
          `${applicationSubmission.typeCode} Proposal incomplete`,
        ),
      );
    }

    if (
      applicationSubmission.soilIsNOIFollowUp &&
      !applicationSubmission.soilNOIIDs
    ) {
      errors.push(
        new ServiceValidationException(
          `${applicationSubmission.typeCode} Proposal missing NOI IDs`,
        ),
      );
    }

    if (
      applicationSubmission.soilHasPreviousALCAuthorization &&
      !applicationSubmission.soilApplicationIDs
    ) {
      errors.push(
        new ServiceValidationException(
          `${applicationSubmission.typeCode} Proposal missing Application IDs`,
        ),
      );
    }

    const proposalMaps = applicantDocuments.filter(
      (document) => document.typeCode === DOCUMENT_TYPE.PROPOSAL_MAP,
    );
    if (proposalMaps.length === 0) {
      errors.push(
        new ServiceValidationException(
          `${applicationSubmission.typeCode} proposal missing Proposal Map / Site Plan`,
        ),
      );
    }

    const crossSections = applicantDocuments.filter(
      (document) => document.typeCode === DOCUMENT_TYPE.CROSS_SECTIONS,
    );
    if (crossSections.length === 0) {
      errors.push(
        new ServiceValidationException(
          `${applicationSubmission.typeCode} proposal missing Cross Section Diagrams`,
        ),
      );
    }

    const reclamationPlans = applicantDocuments.filter(
      (document) => document.typeCode === DOCUMENT_TYPE.RECLAMATION_PLAN,
    );
    if (reclamationPlans.length === 0) {
      errors.push(
        new ServiceValidationException(
          `${applicationSubmission.typeCode} proposal missing Reclamation Plans`,
        ),
      );
    }
  }

  private async validatePfrsProposal(
    applicationSubmission: ApplicationSubmission,
    applicationDocuments: ApplicationDocument[],
    errors: Error[],
  ) {
    if (applicationSubmission.soilIsExtractionOrMining === null) {
      errors.push(
        new ServiceValidationException(
          `${applicationSubmission.typeCode} proposal missing extraction/mining answer`,
        ),
      );
    }

    if (applicationSubmission.soilIsExtractionOrMining) {
      if (applicationSubmission.soilHasSubmittedNotice === null) {
        errors.push(
          new ServiceValidationException(
            `${applicationSubmission.typeCode} proposal missing notice submitted answer`,
          ),
        );
      }
    }

    const noticeOfWork = applicationDocuments.filter(
      (document) => document.typeCode === DOCUMENT_TYPE.NOTICE_OF_WORK,
    );
    if (applicationSubmission.soilIsNOIFollowUp && noticeOfWork.length === 0) {
      errors.push(
        new ServiceValidationException(
          `${applicationSubmission.typeCode} proposal has yes to notice of work but is not attached`,
        ),
      );
    }
  }
}
