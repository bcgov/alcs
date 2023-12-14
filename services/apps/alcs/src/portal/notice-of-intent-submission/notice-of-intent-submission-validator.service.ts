import { ServiceValidationException } from '@app/common/exceptions/base.exception';
import { Injectable, Logger } from '@nestjs/common';
import { LocalGovernmentService } from '../../alcs/local-government/local-government.service';
import { NoticeOfIntentDocument } from '../../alcs/notice-of-intent/notice-of-intent-document/notice-of-intent-document.entity';
import { NoticeOfIntentDocumentService } from '../../alcs/notice-of-intent/notice-of-intent-document/notice-of-intent-document.service';
import { OWNER_TYPE } from '../../common/owner-type/owner-type.entity';
import { DOCUMENT_TYPE } from '../../document/document-code.entity';
import { NoticeOfIntentOwner } from './notice-of-intent-owner/notice-of-intent-owner.entity';
import { NoticeOfIntentParcel } from './notice-of-intent-parcel/notice-of-intent-parcel.entity';
import { NoticeOfIntentParcelService } from './notice-of-intent-parcel/notice-of-intent-parcel.service';
import { NoticeOfIntentSubmission } from './notice-of-intent-submission.entity';

export class ValidatedNoticeOfIntentSubmission extends NoticeOfIntentSubmission {
  applicant: string;
  localGovernmentUuid: string;
  parcels: NoticeOfIntentParcel[];
  primaryContact: NoticeOfIntentOwner;
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
export class NoticeOfIntentSubmissionValidatorService {
  private logger: Logger = new Logger(
    NoticeOfIntentSubmissionValidatorService.name,
  );

  constructor(
    private localGovernmentService: LocalGovernmentService,
    private noiParcelService: NoticeOfIntentParcelService,
    private noiDocumentService: NoticeOfIntentDocumentService,
  ) {}

  async validateSubmission(noticeOfIntentSubmission: NoticeOfIntentSubmission) {
    const errors: Error[] = [];

    if (!noticeOfIntentSubmission.applicant) {
      errors.push(new ServiceValidationException('Missing applicant'));
    }

    if (!noticeOfIntentSubmission.purpose) {
      errors.push(new ServiceValidationException('Missing purpose'));
    }

    await this.validateParcels(noticeOfIntentSubmission, errors);

    const applicantDocuments =
      await this.noiDocumentService.getApplicantDocuments(
        noticeOfIntentSubmission.fileNumber,
      );

    await this.validatePrimaryContact(
      noticeOfIntentSubmission,
      applicantDocuments,
      errors,
    );

    await this.validateLocalGovernment(noticeOfIntentSubmission, errors);
    await this.validateLandUse(noticeOfIntentSubmission, errors);
    this.validateAdditionalInfo(
      noticeOfIntentSubmission,
      applicantDocuments,
      errors,
    );
    await this.validateOptionalDocuments(applicantDocuments, errors);

    if (noticeOfIntentSubmission.typeCode === 'ROSO') {
      await this.validateRosoProposal(
        noticeOfIntentSubmission,
        applicantDocuments,
        errors,
      );
    }
    if (noticeOfIntentSubmission.typeCode === 'POFO') {
      await this.validatePofoProposal(
        noticeOfIntentSubmission,
        applicantDocuments,
        errors,
      );
    }
    if (noticeOfIntentSubmission.typeCode === 'PFRS') {
      await this.validatePofoProposal(
        noticeOfIntentSubmission,
        applicantDocuments,
        errors,
      );
      await this.validateRosoProposal(
        noticeOfIntentSubmission,
        applicantDocuments,
        errors,
      );
      await this.validatePfrsProposal(
        noticeOfIntentSubmission,
        applicantDocuments,
        errors,
      );
    }

    return {
      errors,
      noticeOfIntentSubmission:
        errors.length === 0
          ? (noticeOfIntentSubmission as ValidatedNoticeOfIntentSubmission)
          : undefined,
    };
  }

  private async validateParcels(
    noticeOfIntentSubmission: NoticeOfIntentSubmission,
    errors: Error[],
  ) {
    const parcels = await this.noiParcelService.fetchByFileId(
      noticeOfIntentSubmission.fileNumber,
    );

    if (parcels.length === 0) {
      errors.push(
        new ServiceValidationException(`Notice of Intent has no parcels`),
      );
    }

    for (const parcel of parcels) {
      if (
        parcel.legalDescription === null ||
        parcel.mapAreaHectares === null ||
        parcel.civicAddress === null ||
        parcel.isFarm === null ||
        !parcel.isConfirmedByApplicant
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

      if (parcel.owners.length === 0) {
        errors.push(
          new ServiceValidationException(`Parcel has no Owners ${parcel.uuid}`),
        );
      }

      if (
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
    noticeOfIntentSubmission: NoticeOfIntentSubmission,
    documents: NoticeOfIntentDocument[],
    errors: Error[],
  ): Promise<NoticeOfIntentOwner | undefined> {
    const primaryOwner = noticeOfIntentSubmission.owners.find(
      (owner) =>
        owner.uuid === noticeOfIntentSubmission.primaryContactOwnerUuid,
    );

    if (!primaryOwner) {
      errors.push(
        new ServiceValidationException(
          `Notice of Intent has no primary contact`,
        ),
      );
      return;
    }

    const onlyHasIndividualOwner =
      noticeOfIntentSubmission.owners.length === 1 &&
      noticeOfIntentSubmission.owners[0].type.code === OWNER_TYPE.INDIVIDUAL;

    const isGovernmentContact =
      primaryOwner.type.code === OWNER_TYPE.GOVERNMENT;

    if (!onlyHasIndividualOwner && !isGovernmentContact) {
      const authorizationLetters = documents.filter(
        (document) =>
          document.type?.code === DOCUMENT_TYPE.AUTHORIZATION_LETTER,
      );
      if (authorizationLetters.length === 0) {
        errors.push(
          new ServiceValidationException(
            `Notice of Intent has no authorization letters`,
          ),
        );
      }
    }

    if (primaryOwner.type.code === OWNER_TYPE.AGENT || isGovernmentContact) {
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
    noticeOfIntentSubmission: NoticeOfIntentSubmission,
    errors: Error[],
  ) {
    const localGovernments = await this.localGovernmentService.list();
    const matchingLg = localGovernments.find(
      (lg) => lg.uuid === noticeOfIntentSubmission.localGovernmentUuid,
    );
    if (!noticeOfIntentSubmission.localGovernmentUuid) {
      errors.push(
        new ServiceValidationException(
          'Notice of Intent has no local government',
        ),
      );
    }

    if (!matchingLg) {
      errors.push(
        new ServiceValidationException(
          'Cannot find local government set on Notice of Intent',
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
    noticeOfIntentSubmission: NoticeOfIntentSubmission,
    errors: Error[],
  ) {
    if (
      !noticeOfIntentSubmission.parcelsAgricultureDescription ||
      !noticeOfIntentSubmission.parcelsAgricultureImprovementDescription ||
      !noticeOfIntentSubmission.parcelsNonAgricultureUseDescription
    ) {
      errors.push(new ServiceValidationException(`Invalid Parcel Description`));
    }

    if (
      !noticeOfIntentSubmission.northLandUseType ||
      !noticeOfIntentSubmission.northLandUseTypeDescription ||
      !noticeOfIntentSubmission.eastLandUseType ||
      !noticeOfIntentSubmission.eastLandUseTypeDescription ||
      !noticeOfIntentSubmission.southLandUseType ||
      !noticeOfIntentSubmission.southLandUseTypeDescription ||
      !noticeOfIntentSubmission.westLandUseType ||
      !noticeOfIntentSubmission.westLandUseTypeDescription
    ) {
      errors.push(new ServiceValidationException(`Invalid Adjacent Parcels`));
    }
  }

  private async validateOptionalDocuments(
    applicantDocuments: NoticeOfIntentDocument[],
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

  private async validateRosoProposal(
    noticeOfIntentSubmission: NoticeOfIntentSubmission,
    applicantDocuments: NoticeOfIntentDocument[],
    errors: Error[],
  ) {
    if (noticeOfIntentSubmission.soilTypeRemoved === null) {
      errors.push(
        new ServiceValidationException(
          `${noticeOfIntentSubmission.typeCode} proposal incomplete`,
        ),
      );
    }

    if (
      noticeOfIntentSubmission.soilToRemoveVolume === null ||
      noticeOfIntentSubmission.soilToRemoveArea === null ||
      noticeOfIntentSubmission.soilToRemoveMaximumDepth === null ||
      noticeOfIntentSubmission.soilToRemoveAverageDepth === null ||
      noticeOfIntentSubmission.soilAlreadyRemovedVolume === null ||
      noticeOfIntentSubmission.soilAlreadyRemovedArea === null ||
      noticeOfIntentSubmission.soilAlreadyRemovedMaximumDepth === null ||
      noticeOfIntentSubmission.soilAlreadyRemovedAverageDepth === null
    ) {
      errors.push(
        new ServiceValidationException(
          `${noticeOfIntentSubmission.typeCode} Soil Table Incomplete`,
        ),
      );
    }
    this.runSharedSoilValidation(
      noticeOfIntentSubmission,
      errors,
      applicantDocuments,
    );
  }

  private async validatePofoProposal(
    noticeOfIntentSubmission: NoticeOfIntentSubmission,
    applicantDocuments: NoticeOfIntentDocument[],
    errors: Error[],
  ) {
    if (noticeOfIntentSubmission.soilFillTypeToPlace === null) {
      errors.push(
        new ServiceValidationException(
          `${noticeOfIntentSubmission.typeCode} proposal incomplete`,
        ),
      );
    }

    if (
      noticeOfIntentSubmission.soilToPlaceVolume === null ||
      noticeOfIntentSubmission.soilToPlaceArea === null ||
      noticeOfIntentSubmission.soilToPlaceMaximumDepth === null ||
      noticeOfIntentSubmission.soilToPlaceAverageDepth === null ||
      noticeOfIntentSubmission.soilAlreadyPlacedVolume === null ||
      noticeOfIntentSubmission.soilAlreadyPlacedArea === null ||
      noticeOfIntentSubmission.soilAlreadyPlacedMaximumDepth === null ||
      noticeOfIntentSubmission.soilAlreadyPlacedAverageDepth === null
    ) {
      errors.push(
        new ServiceValidationException(
          `${noticeOfIntentSubmission.typeCode} Soil Table Incomplete`,
        ),
      );
    }

    this.runSharedSoilValidation(
      noticeOfIntentSubmission,
      errors,
      applicantDocuments,
    );
  }

  private async validatePfrsProposal(
    noticeOfIntentSubmission: NoticeOfIntentSubmission,
    applicantDocuments: NoticeOfIntentDocument[],
    errors: Error[],
  ) {
    if (noticeOfIntentSubmission.soilIsExtractionOrMining === null) {
      errors.push(
        new ServiceValidationException(
          `${noticeOfIntentSubmission.typeCode} proposal missing extraction/mining answer`,
        ),
      );
    }

    if (noticeOfIntentSubmission.soilIsExtractionOrMining) {
      if (noticeOfIntentSubmission.soilHasSubmittedNotice === null) {
        errors.push(
          new ServiceValidationException(
            `${noticeOfIntentSubmission.typeCode} proposal missing notice submitted answer`,
          ),
        );
      }
    }

    this.runSharedSoilValidation(
      noticeOfIntentSubmission,
      errors,
      applicantDocuments,
    );

    const noticeOfWork = applicantDocuments.filter(
      (document) => document.typeCode === DOCUMENT_TYPE.NOTICE_OF_WORK,
    );
    if (
      noticeOfIntentSubmission.soilHasSubmittedNotice &&
      noticeOfWork.length === 0
    ) {
      errors.push(
        new ServiceValidationException(
          `${noticeOfIntentSubmission.typeCode} proposal has yes to notice of work but is not attached`,
        ),
      );
    }
  }

  private runSharedSoilValidation(
    noticeOfIntentSubmission: NoticeOfIntentSubmission,
    errors: Error[],
    applicantDocuments: NoticeOfIntentDocument[],
  ) {
    if (
      noticeOfIntentSubmission.soilIsFollowUp === null ||
      noticeOfIntentSubmission.soilProjectDurationAmount === null ||
      noticeOfIntentSubmission.soilProjectDurationUnit === null
    ) {
      errors.push(
        new ServiceValidationException(
          `${noticeOfIntentSubmission.typeCode} proposal missing shared fields`,
        ),
      );
    }

    if (
      noticeOfIntentSubmission.soilIsFollowUp &&
      !noticeOfIntentSubmission.soilFollowUpIDs
    ) {
      errors.push(
        new ServiceValidationException(
          `${noticeOfIntentSubmission.typeCode} proposal missing Application or NOI IDs`,
        ),
      );
    }

    const proposalMaps = applicantDocuments.filter(
      (document) => document.typeCode === DOCUMENT_TYPE.PROPOSAL_MAP,
    );
    if (proposalMaps.length === 0) {
      errors.push(
        new ServiceValidationException(
          `${noticeOfIntentSubmission.typeCode} proposal missing Proposal Map / Site Plan`,
        ),
      );
    }

    if (noticeOfIntentSubmission.soilIsExtractionOrMining) {
      const crossSections = applicantDocuments.filter(
        (document) => document.typeCode === DOCUMENT_TYPE.CROSS_SECTIONS,
      );
      if (crossSections.length === 0) {
        errors.push(
          new ServiceValidationException(
            `${noticeOfIntentSubmission.typeCode} proposal missing Cross Section Diagrams`,
          ),
        );
      }

      const reclamationPlans = applicantDocuments.filter(
        (document) => document.typeCode === DOCUMENT_TYPE.RECLAMATION_PLAN,
      );
      if (reclamationPlans.length === 0) {
        errors.push(
          new ServiceValidationException(
            `${noticeOfIntentSubmission.typeCode} proposal missing Reclamation Plans`,
          ),
        );
      }

      if (noticeOfIntentSubmission.soilHasSubmittedNotice === null) {
        errors.push(
          new ServiceValidationException(
            `${noticeOfIntentSubmission.typeCode} proposal missing work notice answer`,
          ),
        );
      }

      if (noticeOfIntentSubmission.soilHasSubmittedNotice) {
        const noticeOfWorks = applicantDocuments.filter(
          (document) => document.typeCode === DOCUMENT_TYPE.NOTICE_OF_WORK,
        );
        if (noticeOfWorks.length === 0) {
          errors.push(
            new ServiceValidationException(
              `${noticeOfIntentSubmission.typeCode} proposal missing Notice of Work`,
            ),
          );
        }
      }
    }
  }

  private validateAdditionalInfo(
    noticeOfIntentSubmission: NoticeOfIntentSubmission,
    applicantDocuments: NoticeOfIntentDocument[],
    errors: Error[],
  ) {
    if (noticeOfIntentSubmission.soilIsRemovingSoilForNewStructure === null) {
      errors.push(
        new ServiceValidationException(
          `${noticeOfIntentSubmission.typeCode} proposal missing structure questions`,
        ),
      );
    }

    if (noticeOfIntentSubmission.soilIsRemovingSoilForNewStructure) {
      if (noticeOfIntentSubmission.soilProposedStructures.length === 0) {
        errors.push(
          new ServiceValidationException(
            `${noticeOfIntentSubmission.typeCode} proposal missing structures`,
          ),
        );
      }

      for (const structure of noticeOfIntentSubmission.soilProposedStructures) {
        if (!structure.type || structure.area === null) {
          errors.push(
            new ServiceValidationException(
              `${noticeOfIntentSubmission.typeCode} proposal incomplete structure`,
            ),
          );
        }
      }

      const buildingPlans = applicantDocuments.filter(
        (document) => document.typeCode === DOCUMENT_TYPE.BUILDING_PLAN,
      );
      if (buildingPlans.length === 0) {
        errors.push(
          new ServiceValidationException(
            `${noticeOfIntentSubmission.typeCode} proposal missing Building Plans`,
          ),
        );
      }

      const hasFarmStructure =
        noticeOfIntentSubmission.soilProposedStructures.some(
          (structure) => structure.type === 'Farm Structure',
        );
      if (hasFarmStructure) {
        if (!noticeOfIntentSubmission.soilStructureFarmUseReason) {
          errors.push(
            new ServiceValidationException(
              `${noticeOfIntentSubmission.typeCode} proposal missing farm use reason`,
            ),
          );
        }
        if (!noticeOfIntentSubmission.soilAgriParcelActivity) {
          errors.push(
            new ServiceValidationException(
              `${noticeOfIntentSubmission.typeCode} proposal missing agricultural activity`,
            ),
          );
        }
      }

      const hasResidentialStructure =
        noticeOfIntentSubmission.soilProposedStructures.some((structure) =>
          [
            'Residential - Principal Residence',
            'Residential - Additional Residence',
            'Residential - Accessory Structure',
          ].includes(structure.type!),
        );
      if (
        hasResidentialStructure &&
        !noticeOfIntentSubmission.soilStructureResidentialUseReason
      ) {
        errors.push(
          new ServiceValidationException(
            `${noticeOfIntentSubmission.typeCode} proposal missing residential use reason`,
          ),
        );
      }
    }

    const hasAccessoryStructure =
      noticeOfIntentSubmission.soilProposedStructures.find(
        (structure) => structure.type === 'Residential - Accessory Structure',
      );
    if (
      hasAccessoryStructure &&
      !noticeOfIntentSubmission.soilStructureResidentialAccessoryUseReason
    ) {
      errors.push(
        new ServiceValidationException(
          `${noticeOfIntentSubmission.typeCode} proposal missing accessory use reason`,
        ),
      );
    }
  }
}
