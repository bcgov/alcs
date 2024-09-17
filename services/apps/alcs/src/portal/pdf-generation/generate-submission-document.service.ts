import { CdogsService } from '@app/common/cdogs/cdogs.service';
import {
  forwardRef,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import * as config from 'config';
import * as dayjs from 'dayjs';
import {
  ApplicationDocument,
  VISIBILITY_FLAG,
} from '../../alcs/application/application-document/application-document.entity';
import { ApplicationDocumentService } from '../../alcs/application/application-document/application-document.service';
import { ApplicationService } from '../../alcs/application/application.service';
import { LocalGovernment } from '../../alcs/local-government/local-government.entity';
import { LocalGovernmentService } from '../../alcs/local-government/local-government.service';
import { OWNER_TYPE } from '../../common/owner-type/owner-type.entity';
import { DOCUMENT_TYPE } from '../../document/document-code.entity';
import { DOCUMENT_SOURCE, DOCUMENT_SYSTEM } from '../../document/document.dto';
import { User } from '../../user/user.entity';
import { formatBooleanToYesNoString } from '../../utils/boolean-formatter';
import { ApplicationOwnerService } from '../application-submission/application-owner/application-owner.service';
import { ApplicationParcel } from '../application-submission/application-parcel/application-parcel.entity';
import { ApplicationParcelService } from '../application-submission/application-parcel/application-parcel.service';
import { ApplicationSubmission } from '../application-submission/application-submission.entity';
import { ApplicationSubmissionService } from '../application-submission/application-submission.service';
import { CovenantTransfereeService } from '../application-submission/covenant-transferee/covenant-transferee.service';

export enum APPLICATION_SUBMISSION_TYPES {
  NFUP = 'NFUP',
  TURP = 'TURP',
  POFO = 'POFO',
  ROSO = 'ROSO',
  PFRS = 'PFRS',
  NARU = 'NARU',
  SUBD = 'SUBD',
  INCL = 'INCL',
  EXCL = 'EXCL',
  COVE = 'COVE',
}

class PdfTemplate {
  templateName: string;
  payload: any;
}

const NO_DATA = 'No Data';
const NOT_APPLICABLE = 'Not Applicable';

@Injectable()
export class GenerateSubmissionDocumentService {
  private logger = new Logger(GenerateSubmissionDocumentService.name);

  constructor(
    private documentGenerationService: CdogsService,
    @Inject(forwardRef(() => ApplicationSubmissionService))
    private applicationSubmissionService: ApplicationSubmissionService,
    private localGovernmentService: LocalGovernmentService,
    private applicationService: ApplicationService,
    @Inject(forwardRef(() => ApplicationParcelService))
    private parcelService: ApplicationParcelService,
    @Inject(forwardRef(() => ApplicationOwnerService))
    private ownerService: ApplicationOwnerService,
    private applicationDocumentService: ApplicationDocumentService,
    private transfereeService: CovenantTransfereeService,
  ) {}

  async generate(fileNumber: string, user: User) {
    const submission =
      await this.applicationSubmissionService.verifyAccessByFileId(
        fileNumber,
        user,
      );

    const template = await this.getPdfTemplateBySubmissionType(
      submission,
      user,
    );

    if (template) {
      return await this.documentGenerationService.generateDocument(
        `${fileNumber}_submission_Date_Time`,
        `${config.get<string>('CDOGS.TEMPLATE_FOLDER')}/submissions/${
          template.templateName
        }`,
        template.payload,
      );
    }
    return;
  }

  async generateAndAttach(fileNumber: string, user: User) {
    const generatedRes = await this.generate(fileNumber, user);

    if (generatedRes && generatedRes.status === HttpStatus.OK) {
      await this.applicationDocumentService.attachDocumentAsBuffer({
        fileNumber: fileNumber,
        fileName: `${fileNumber}_APP_Submission.pdf`,
        user: user,
        file: generatedRes.data,
        mimeType: 'application/pdf',
        fileSize: generatedRes.data.length,
        documentType: DOCUMENT_TYPE.ORIGINAL_SUBMISSION,
        source: DOCUMENT_SOURCE.APPLICANT,
        system: DOCUMENT_SYSTEM.PORTAL,
        visibilityFlags: [
          VISIBILITY_FLAG.APPLICANT,
          VISIBILITY_FLAG.COMMISSIONER,
          VISIBILITY_FLAG.GOVERNMENT,
        ],
      });
    }
  }

  async generateUpdate(fileNumber: string, user: User) {
    const generatedRes = await this.generate(fileNumber, user);

    if (generatedRes && generatedRes.status === HttpStatus.OK) {
      const documents = await this.applicationDocumentService.list(fileNumber);

      const submissionDocuments = documents.filter(
        (document) =>
          [DOCUMENT_SOURCE.APPLICANT, DOCUMENT_SOURCE.ALC].includes(
            document.document.source as DOCUMENT_SOURCE,
          ) &&
          [
            DOCUMENT_TYPE.ORIGINAL_SUBMISSION,
            DOCUMENT_TYPE.UPDATED_SUBMISSION,
          ].includes(document.typeCode as DOCUMENT_TYPE),
      );

      //Clear Visibility Flags of existing documents
      for (const submissionDocument of submissionDocuments) {
        await this.applicationDocumentService.update({
          uuid: submissionDocument.uuid,
          visibilityFlags: [],
          user,
          source: submissionDocument.document.source as DOCUMENT_SOURCE,
          fileName: submissionDocument.document.fileName,
          documentType: submissionDocument.type?.code as DOCUMENT_TYPE,
        });
      }

      await this.applicationDocumentService.attachDocumentAsBuffer({
        fileNumber: fileNumber,
        fileName: `${fileNumber}_Submission_Updated.pdf`,
        user: user,
        file: generatedRes.data,
        mimeType: 'application/pdf',
        fileSize: generatedRes.data.length,
        documentType: DOCUMENT_TYPE.UPDATED_SUBMISSION,
        source: DOCUMENT_SOURCE.ALC,
        system: DOCUMENT_SYSTEM.PORTAL,
        visibilityFlags: [
          VISIBILITY_FLAG.APPLICANT,
          VISIBILITY_FLAG.COMMISSIONER,
          VISIBILITY_FLAG.GOVERNMENT,
        ],
      });
    }
  }

  private async getPdfTemplateBySubmissionType(
    submission: ApplicationSubmission,
    user: User,
  ): Promise<PdfTemplate | undefined> {
    const documents = await this.applicationDocumentService.list(
      submission.fileNumber,
    );

    let payload: any = await this.prepareSubmissionPdfData(
      submission,
      documents,
    );

    switch (submission.typeCode as APPLICATION_SUBMISSION_TYPES) {
      case APPLICATION_SUBMISSION_TYPES.NFUP:
        payload = this.populateNfuData(payload, submission);
        return { payload, templateName: 'nfu-submission-template.docx' };
      case APPLICATION_SUBMISSION_TYPES.NARU:
        payload = this.populateNaruData(payload, submission);
        return { payload, templateName: 'naru-submission-template.docx' };
      case APPLICATION_SUBMISSION_TYPES.TURP:
        payload = this.populateTurData(payload, submission, documents);
        return { payload, templateName: 'tur-submission-template.docx' };
      case APPLICATION_SUBMISSION_TYPES.SUBD:
        payload = this.populateSubdData(payload, submission, documents);
        return { payload, templateName: 'subd-submission-template.docx' };
      case APPLICATION_SUBMISSION_TYPES.ROSO:
        payload = this.populateSoilFields(payload, submission, documents);
        return { payload, templateName: 'roso-submission-template.docx' };
      case APPLICATION_SUBMISSION_TYPES.POFO:
        payload = this.populateSoilFields(payload, submission, documents);
        return { payload, templateName: 'pofo-submission-template.docx' };
      case APPLICATION_SUBMISSION_TYPES.PFRS:
        payload = this.populateSoilFields(payload, submission, documents);
        return { payload, templateName: 'pfrs-submission-template.docx' };
      case APPLICATION_SUBMISSION_TYPES.INCL:
        payload = await this.populateInclExclFields(
          payload,
          submission,
          documents,
          user,
        );
        return { payload, templateName: 'incl-submission-template.docx' };
      case APPLICATION_SUBMISSION_TYPES.EXCL:
        payload = await this.populateInclExclFields(
          payload,
          submission,
          documents,
          user,
        );
        return { payload, templateName: 'excl-submission-template.docx' };
      case APPLICATION_SUBMISSION_TYPES.COVE:
        payload = await this.populateCoveFields(payload, submission, documents);
        return { payload, templateName: 'cove-submission-template.docx' };
      default:
        this.logger.error(
          `Could not find template for application submission type ${submission.typeCode}`,
        );
        return;
    }
  }

  private async prepareSubmissionPdfData(
    submission: ApplicationSubmission,
    documents: ApplicationDocument[],
  ) {
    const application = await this.applicationService.getOrFail(
      submission.fileNumber,
    );

    let localGovernment: LocalGovernment | undefined;
    if (submission.localGovernmentUuid) {
      localGovernment = await this.localGovernmentService.getByUuid(
        submission.localGovernmentUuid,
      );
    }

    const parcels = await this.parcelService.fetchByApplicationFileId(
      submission.fileNumber,
    );

    const owners = await this.ownerService.fetchByApplicationFileId(
      submission.fileNumber,
    );

    const primaryContact = owners.find(
      (e) => e.uuid === submission.primaryContactOwnerUuid,
    );

    const otherDocuments = documents.filter(
      (e) =>
        (!e.typeCode ||
          [
            DOCUMENT_TYPE.PHOTOGRAPH,
            DOCUMENT_TYPE.PROFESSIONAL_REPORT,
            DOCUMENT_TYPE.OTHER,
          ].includes((e.typeCode ?? 'undefined') as DOCUMENT_TYPE)) &&
        e.document.source === DOCUMENT_SOURCE.APPLICANT,
    );

    const proposalMap = documents.filter(
      (document) => document.type?.code === DOCUMENT_TYPE.PROPOSAL_MAP,
    );

    const data = {
      noData: NO_DATA,
      generatedDateTime: dayjs
        .tz(new Date(), 'Canada/Pacific')
        .format('MMM DD, YYYY hh:mm:ss Z'),
      purpose: submission.purpose,
      fileNumber: submission.fileNumber,
      localGovernment: localGovernment?.name,
      status: submission.status.statusType,
      applicant: submission.applicant,
      hasOtherParcelsInCommunity:
        formatBooleanToYesNoString(submission.hasOtherParcelsInCommunity) ??
        NO_DATA,
      otherParcelsDescription: submission.otherParcelsDescription,
      selectedThirdPartyAgent: primaryContact?.type.code === OWNER_TYPE.AGENT,
      primaryContactFirstName: primaryContact?.firstName,
      primaryContactLastName: primaryContact?.lastName,
      primaryContactOrganizationName: primaryContact?.organizationName,
      primaryContactEmail: primaryContact?.email,
      primaryContactPhoneNumber: primaryContact?.phoneNumber,
      primaryContactType: primaryContact?.type?.label,
      organizationText:
        primaryContact?.type.code === OWNER_TYPE.CROWN
          ? 'Department'
          : 'Organization (If Applicable)',
      isGovernmentSetup:
        !localGovernment || localGovernment.bceidBusinessGuid !== null,

      // Land use
      parcelsAgricultureDescription: submission.parcelsAgricultureDescription,
      parcelsAgricultureImprovementDescription:
        submission.parcelsAgricultureImprovementDescription,
      parcelsNonAgricultureUseDescription:
        submission.parcelsNonAgricultureUseDescription,
      northLandUseType: submission.northLandUseType,
      northLandUseTypeDescription: submission.northLandUseTypeDescription,
      eastLandUseType: submission.eastLandUseType,
      eastLandUseTypeDescription: submission.eastLandUseTypeDescription,
      southLandUseType: submission.southLandUseType,
      southLandUseTypeDescription: submission.southLandUseTypeDescription,
      westLandUseType: submission.westLandUseType,
      westLandUseTypeDescription: submission.westLandUseTypeDescription,

      //Common File Types
      proposalMap: proposalMap.find((d) => d)?.document.fileName,

      // Other attachments
      otherAttachments: otherDocuments.map((e) => ({
        type: e.type?.description ?? '',
        description: e.description ?? '',
        name: e.document.fileName,
        noData: NO_DATA,
      })),

      applicationTypePortalLabel: application?.type.portalLabel,
      parcels: this.mapParcelsWithOwners(parcels),
    };

    return data;
  }

  private mapParcelsWithOwners(parcels: ApplicationParcel[]) {
    return parcels.map((e) => ({
      ...e,
      pid: this.formatPid(e.pid),
      noData: NO_DATA,
      purchasedDate: e.purchasedDate ? e.purchasedDate : undefined,
      certificateOfTitle: e.certificateOfTitle?.document.fileName,
      ownershipType: e.ownershipType?.label,
      owners: e.owners.map((o) => ({
        ...o,
        noData: NO_DATA,
        notApplicable: NOT_APPLICABLE,
        name: `${o.firstName} ${o.lastName}`,
        organizationName: o.organizationName,
        corporateSummary: o.corporateSummary?.document.fileName,
      })),
    }));
  }

  private populateNfuData(pdfData: any, submission: ApplicationSubmission) {
    return {
      ...pdfData,

      // NFU Proposal
      nfuHectares: submission.nfuHectares,
      nfuOutsideLands: submission.nfuOutsideLands,
      nfuAgricultureSupport: submission.nfuAgricultureSupport,
      showImportFill: submission.nfuWillImportFill,
      nfuWillImportFill: formatBooleanToYesNoString(
        submission.nfuWillImportFill,
      ),
      // NFU Proposal => Soil and Fill
      nfuFillTypeDescription: submission.nfuFillTypeDescription,
      nfuFillOriginDescription: submission.nfuFillOriginDescription,
      nfuTotalFillArea: submission.nfuTotalFillArea,
      nfuMaxFillDepth: submission.nfuMaxFillDepth,
      nfuAverageFillDepth: submission.nfuAverageFillDepth,
      nfuFillVolume: submission.nfuFillVolume,
      nfuProjectDuration: submission.nfuProjectDuration,
    };
  }

  private populateNaruData(pdfData: any, submission: ApplicationSubmission) {
    return {
      ...pdfData,
      naruWillBeOverFiveHundredM2: formatBooleanToYesNoString(
        submission.naruWillBeOverFiveHundredM2,
      ),
      naruWillRetainResidence: formatBooleanToYesNoString(
        submission.naruWillRetainResidence,
      ),
      naruWillHaveAdditionalResidence: formatBooleanToYesNoString(
        submission.naruWillHaveAdditionalResidence,
      ),
      naruWillHaveTemporaryForeignWorkerHousing: formatBooleanToYesNoString(
        submission.naruWillHaveTemporaryForeignWorkerHousing,
      ),
      naruWillImportFill: formatBooleanToYesNoString(
        submission.naruWillImportFill,
      ),
      naruResidenceNecessity: submission.naruResidenceNecessity,
      naruClustered: submission.naruClustered,
      naruSetback: submission.naruSetback,
      naruLocationRationale: submission.naruLocationRationale,
      naruInfrastructure: submission.naruInfrastructure,

      showImportFill: submission.naruWillImportFill,
      // NFU Proposal => Soil and Fill
      naruFillType: submission.naruFillType,
      naruFillOrigin: submission.naruFillOrigin,
      naruProjectDuration: submission.naruProjectDuration,
      naruToPlaceMaximumDepth: submission.naruToPlaceMaximumDepth,
      naruToPlaceAverageDepth: submission.naruToPlaceAverageDepth,
      naruToPlaceVolume: submission.naruToPlaceVolume,
      naruToPlaceArea: submission.naruToPlaceArea,
    };
  }

  private populateTurData(
    pdfData: any,
    submission: ApplicationSubmission,
    documents: ApplicationDocument[],
  ) {
    const servingNotice = documents.filter(
      (document) => document.type?.code === DOCUMENT_TYPE.SERVING_NOTICE,
    );

    pdfData = {
      ...pdfData,
      turAgriculturalActivities: submission.turAgriculturalActivities,
      turReduceNegativeImpacts: submission.turReduceNegativeImpacts,
      turOutsideLands: submission.turOutsideLands,
      turTotalCorridorArea: submission.turTotalCorridorArea,
      servingNotice: servingNotice.find((d) => d)?.document.fileName,
    };

    return pdfData;
  }

  private populateSubdData(
    pdfData: any,
    submission: ApplicationSubmission,
    documents: ApplicationDocument[],
  ) {
    const homesiteSeverance = documents.filter(
      (document) => document.type?.code === DOCUMENT_TYPE.HOMESITE_SEVERANCE,
    );

    pdfData = {
      ...pdfData,
      subdSuitability: submission.subdSuitability,
      subdAgricultureSupport: submission.subdAgricultureSupport,
      subdIsHomeSiteSeverance: formatBooleanToYesNoString(
        submission.subdIsHomeSiteSeverance,
      ),
      subdProposedLots: submission.subdProposedLots.map((lot, index) => ({
        ...lot,
        index: index + 1,
        noData: NO_DATA,
      })),
      homesiteSeverance: homesiteSeverance.map((d) => d.document),
    };

    return pdfData;
  }

  private populateSoilFields(
    pdfData: any,
    submission: ApplicationSubmission,
    documents: ApplicationDocument[],
  ) {
    const crossSections = documents.filter(
      (document) => document.type?.code === DOCUMENT_TYPE.CROSS_SECTIONS,
    );

    const reclamationPlans = documents.filter(
      (document) => document.type?.code === DOCUMENT_TYPE.RECLAMATION_PLAN,
    );

    const noticesOfWork = documents.filter(
      (document) => document.type?.code === DOCUMENT_TYPE.NOTICE_OF_WORK,
    );

    pdfData = {
      ...pdfData,
      fillProjectDuration: submission.fillProjectDuration,
      soilIsFollowUp: formatBooleanToYesNoString(submission.soilIsFollowUp),
      soilFollowUpIDs: submission.soilFollowUpIDs,
      soilProjectDuration: submission.soilProjectDuration,
      soilTypeRemoved: submission.soilTypeRemoved,
      soilReduceNegativeImpacts: submission.soilReduceNegativeImpacts,
      soilToRemoveVolume: submission.soilToRemoveVolume,
      soilToRemoveArea: submission.soilToRemoveArea,
      soilToRemoveMaximumDepth: submission.soilToRemoveMaximumDepth,
      soilToRemoveAverageDepth: submission.soilToRemoveAverageDepth,
      soilAlreadyRemovedVolume: submission.soilAlreadyRemovedVolume,
      soilAlreadyRemovedArea: submission.soilAlreadyRemovedArea,
      soilAlreadyRemovedMaximumDepth: submission.soilAlreadyRemovedMaximumDepth,
      soilAlreadyRemovedAverageDepth: submission.soilAlreadyRemovedAverageDepth,

      soilToPlaceVolume: submission.soilToPlaceVolume,
      soilToPlaceArea: submission.soilToPlaceArea,
      soilToPlaceMaximumDepth: submission.soilToPlaceMaximumDepth,
      soilToPlaceAverageDepth: submission.soilToPlaceAverageDepth,
      soilAlreadyPlacedVolume: submission.soilAlreadyPlacedVolume,
      soilAlreadyPlacedArea: submission.soilAlreadyPlacedArea,
      soilAlreadyPlacedMaximumDepth: submission.soilAlreadyPlacedMaximumDepth,
      soilAlreadyPlacedAverageDepth: submission.soilAlreadyPlacedAverageDepth,
      soilFillTypeToPlace: submission.soilFillTypeToPlace,
      soilAlternativeMeasures: submission.soilAlternativeMeasures,

      crossSections: crossSections.map((d) => d.document),
      reclamationPlans: reclamationPlans.map((d) => d.document),
      noticesOfWork: noticesOfWork.map((d) => d.document),
      soilIsExtractionOrMining: formatBooleanToYesNoString(
        submission.soilIsExtractionOrMining,
      ),
      soilHasSubmittedNotice: formatBooleanToYesNoString(
        submission.soilHasSubmittedNotice,
      ),
    };

    return pdfData;
  }

  private async populateInclExclFields(
    pdfData: any,
    submission: ApplicationSubmission,
    documents: ApplicationDocument[],
    user: User,
  ) {
    let userGovernment: LocalGovernment | null = null;
    if (user.bceidBusinessGuid) {
      userGovernment = await this.localGovernmentService.getByGuid(
        user.bceidBusinessGuid,
      );
    }

    const proofOfAdvertising = documents.filter(
      (document) => document.type?.code === DOCUMENT_TYPE.PROOF_OF_ADVERTISING,
    );

    const proofOfSignage = documents.filter(
      (document) => document.type?.code === DOCUMENT_TYPE.PROOF_OF_SIGNAGE,
    );

    const publicHearingReports = documents.filter(
      (document) =>
        document.type?.code === DOCUMENT_TYPE.REPORT_OF_PUBLIC_HEARING,
    );

    pdfData = {
      ...pdfData,
      userGovernmentName: userGovernment?.name,
      inclExclHectares: submission.inclExclHectares,
      inclAgricultureSupport: submission.inclAgricultureSupport,
      inclImprovements: submission.inclImprovements,
      inclGovernmentOwnsAllParcels: formatBooleanToYesNoString(
        submission.inclGovernmentOwnsAllParcels,
      ),
      prescribedBody: submission.prescribedBody,
      exclShareGovernmentBorders: formatBooleanToYesNoString(
        submission.exclShareGovernmentBorders,
      ),
      exclWhyLand: submission.exclWhyLand,
      proofOfAdvertising: proofOfAdvertising.map((d) => d.document),
      proofOfSignage: proofOfSignage.map((d) => d.document),
      publicHearingReports: publicHearingReports.map((d) => d.document),
    };

    return pdfData;
  }

  private async populateCoveFields(
    pdfData: any,
    submission: ApplicationSubmission,
    documents: ApplicationDocument[],
  ) {
    const draftCovenants = documents.filter(
      (document) => document.type?.code === DOCUMENT_TYPE.SRW_TERMS,
    );

    const transferees = await this.transfereeService.fetchBySubmissionUuid(
      submission.uuid,
    );
    const mappedTransferees = transferees.map((t) => ({
      type: t.type.label,
      fullName: `${t.firstName} ${t.lastName}`,
      organizationName: t.organizationName ?? NOT_APPLICABLE,
      phone: t.phoneNumber,
      email: t.email,
    }));

    pdfData = {
      ...pdfData,
      transferees: mappedTransferees,
      coveAreaImpacted: submission.coveAreaImpacted,
      coveFarmImpact: submission.coveFarmImpact,
      coveHasDraft: formatBooleanToYesNoString(submission.coveHasDraft),
      draftCovenants: draftCovenants.map((d) => d.document),
    };

    return pdfData;
  }

  private formatPid(pid?: string | null) {
    const matches = pid?.match(/(.{1,3})/g);
    if (matches) {
      return matches.join('-');
    }
    return undefined;
  }
}
