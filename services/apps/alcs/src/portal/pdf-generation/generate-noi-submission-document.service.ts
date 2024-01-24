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
import { VISIBILITY_FLAG } from '../../alcs/application/application-document/application-document.entity';
import { LocalGovernment } from '../../alcs/local-government/local-government.entity';
import { LocalGovernmentService } from '../../alcs/local-government/local-government.service';
import { NoticeOfIntentDocument } from '../../alcs/notice-of-intent/notice-of-intent-document/notice-of-intent-document.entity';
import { NoticeOfIntentDocumentService } from '../../alcs/notice-of-intent/notice-of-intent-document/notice-of-intent-document.service';
import { NoticeOfIntentService } from '../../alcs/notice-of-intent/notice-of-intent.service';
import { OWNER_TYPE } from '../../common/owner-type/owner-type.entity';
import { DOCUMENT_TYPE } from '../../document/document-code.entity';
import { DOCUMENT_SOURCE, DOCUMENT_SYSTEM } from '../../document/document.dto';
import { User } from '../../user/user.entity';
import { formatBooleanToYesNoString } from '../../utils/boolean-formatter';
import { NoticeOfIntentOwnerService } from '../notice-of-intent-submission/notice-of-intent-owner/notice-of-intent-owner.service';
import { NoticeOfIntentParcel } from '../notice-of-intent-submission/notice-of-intent-parcel/notice-of-intent-parcel.entity';
import { NoticeOfIntentParcelService } from '../notice-of-intent-submission/notice-of-intent-parcel/notice-of-intent-parcel.service';
import { NoticeOfIntentSubmission } from '../notice-of-intent-submission/notice-of-intent-submission.entity';
import { NoticeOfIntentSubmissionService } from '../notice-of-intent-submission/notice-of-intent-submission.service';

export enum NOI_SUBMISSION_TYPES {
  POFO = 'POFO',
  ROSO = 'ROSO',
  PFRS = 'PFRS',
}

class PdfTemplate {
  templateName: string;
  payload: any;
}

const NO_DATA = 'No Data';
const NOT_APPLICABLE = 'Not Applicable';

@Injectable()
export class GenerateNoiSubmissionDocumentService {
  private logger = new Logger(GenerateNoiSubmissionDocumentService.name);

  constructor(
    private documentGenerationService: CdogsService,
    @Inject(forwardRef(() => NoticeOfIntentSubmissionService))
    private noiSubmissionService: NoticeOfIntentSubmissionService,
    private localGovernmentService: LocalGovernmentService,
    private noticeOfIntentService: NoticeOfIntentService,
    @Inject(forwardRef(() => NoticeOfIntentParcelService))
    private parcelService: NoticeOfIntentParcelService,
    @Inject(forwardRef(() => NoticeOfIntentOwnerService))
    private ownerService: NoticeOfIntentOwnerService,
    private noiDocumentService: NoticeOfIntentDocumentService,
  ) {}

  async generate(fileNumber: string, user: User) {
    const submission = await this.noiSubmissionService.getByFileNumber(
      fileNumber,
      user,
    );

    const template = await this.getPdfTemplateBySubmissionType(submission);

    if (template) {
      return await this.documentGenerationService.generateDocument(
        `${fileNumber}_submission_Date_Time`,
        `${config.get<string>('CDOGS.TEMPLATE_FOLDER')}/noi-submissions/${
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
      await this.noiDocumentService.attachDocumentAsBuffer({
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
      const documents = await this.noiDocumentService.list(fileNumber);

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
        await this.noiDocumentService.update({
          uuid: submissionDocument.uuid,
          visibilityFlags: [],
          user,
          source: submissionDocument.document.source as DOCUMENT_SOURCE,
          fileName: submissionDocument.document.fileName,
          documentType: submissionDocument.type?.code as DOCUMENT_TYPE,
        });
      }

      await this.noiDocumentService.attachDocumentAsBuffer({
        fileNumber: fileNumber,
        fileName: `${fileNumber}_Submission_Updated`,
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
    submission: NoticeOfIntentSubmission,
  ): Promise<PdfTemplate | undefined> {
    const documents = await this.noiDocumentService.list(submission.fileNumber);

    let payload: any = await this.prepareSubmissionPdfData(
      submission,
      documents,
    );

    switch (submission.typeCode as NOI_SUBMISSION_TYPES) {
      case NOI_SUBMISSION_TYPES.ROSO:
        payload = this.populateSoilFields(payload, submission, documents);
        return { payload, templateName: 'noi-roso-submission-template.docx' };
      case NOI_SUBMISSION_TYPES.POFO:
        payload = this.populateSoilFields(payload, submission, documents);
        return { payload, templateName: 'noi-pofo-submission-template.docx' };
      case NOI_SUBMISSION_TYPES.PFRS:
        payload = this.populateSoilFields(payload, submission, documents);
        return { payload, templateName: 'noi-pfrs-submission-template.docx' };
      default:
        this.logger.error(
          `Could not find template for application submission type ${submission.typeCode}`,
        );
        return;
    }
  }

  private async prepareSubmissionPdfData(
    submission: NoticeOfIntentSubmission,
    documents: NoticeOfIntentDocument[],
  ) {
    const noticeOfIntent = await this.noticeOfIntentService.getByFileNumber(
      submission.fileNumber,
    );

    let localGovernment: LocalGovernment | undefined;
    if (submission.localGovernmentUuid) {
      localGovernment = await this.localGovernmentService.getByUuid(
        submission.localGovernmentUuid,
      );
    }

    const parcels = await this.parcelService.fetchByFileId(
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
        !e.typeCode ||
        [
          DOCUMENT_TYPE.PHOTOGRAPH,
          DOCUMENT_TYPE.PROFESSIONAL_REPORT,
          DOCUMENT_TYPE.OTHER,
        ].includes((e.typeCode ?? 'undefined') as DOCUMENT_TYPE),
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

      applicationTypePortalLabel: noticeOfIntent?.type.portalLabel,
      parcels: this.mapParcelsWithOwners(parcels),
    };

    return data;
  }

  private mapParcelsWithOwners(parcels: NoticeOfIntentParcel[]) {
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

  private populateSoilFields(
    pdfData: any,
    submission: NoticeOfIntentSubmission,
    documents: NoticeOfIntentDocument[],
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

    const buildingPlans = documents.filter(
      (document) => document.type?.code === DOCUMENT_TYPE.BUILDING_PLAN,
    );

    pdfData = {
      ...pdfData,
      fillProjectDuration: submission.fillProjectDuration,
      soilIsFollowUp: formatBooleanToYesNoString(submission.soilIsFollowUp),
      soilFollowUpIDs: submission.soilFollowUpIDs,
      soilProjectDuration: submission.soilProjectDuration,
      soilTypeRemoved: submission.soilTypeRemoved,
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

      crossSections: crossSections.map((d) => d.document),
      reclamationPlans: reclamationPlans.map((d) => d.document),
      noticesOfWork: noticesOfWork.map((d) => d.document),
      buildingPlans: buildingPlans.map((d) => d.document),
      soilIsExtractionOrMining: formatBooleanToYesNoString(
        submission.soilIsExtractionOrMining,
      ),
      soilIsAreaWideFilling: formatBooleanToYesNoString(
        submission.soilIsAreaWideFilling,
      ),
      soilHasSubmittedNotice: formatBooleanToYesNoString(
        submission.soilHasSubmittedNotice,
      ),
      soilIsRemovingSoilForNewStructure: formatBooleanToYesNoString(
        submission.soilIsRemovingSoilForNewStructure,
      ),
      soilProposedStructures: submission.soilProposedStructures.map(
        (structure, index) => ({ ...structure, index }),
      ),
      soilStructureFarmUseReason: submission.soilStructureFarmUseReason,
      soilStructureResidentialUseReason:
        submission.soilStructureResidentialUseReason,
      soilAgriParcelActivity: submission.soilAgriParcelActivity,
      soilStructureResidentialAccessoryUseReason:
        submission.soilStructureResidentialAccessoryUseReason,
      soilStructureOtherUseReason: submission.soilStructureOtherUseReason,
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
