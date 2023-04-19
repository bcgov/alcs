import { forwardRef, Inject, Injectable } from '@nestjs/common';
import * as config from 'config';
import * as dayjs from 'dayjs';
import { CdogsService } from '../../../../../../libs/common/src/cdogs/cdogs.service';
import { ServiceNotFoundException } from '../../../../../../libs/common/src/exceptions/base.exception';
import { ApplicationLocalGovernmentService } from '../../../alcs/application/application-code/application-local-government/application-local-government.service';
import { DOCUMENT_TYPE } from '../../../alcs/application/application-document/application-document-code.entity';
import { ApplicationDocument } from '../../../alcs/application/application-document/application-document.entity';
import { ApplicationDocumentService } from '../../../alcs/application/application-document/application-document.service';
import { ApplicationService } from '../../../alcs/application/application.service';
import { User } from '../../../user/user.entity';
import { ApplicationOwnerService } from '../application-owner/application-owner.service';
import { PARCEL_TYPE } from '../application-parcel/application-parcel.dto';
import { ApplicationParcel } from '../application-parcel/application-parcel.entity';
import { ApplicationParcelService } from '../application-parcel/application-parcel.service';
import { ApplicationSubmission } from '../application-submission.entity';
import { ApplicationSubmissionService } from '../application-submission.service';

export enum APPLICATION_SUBMISSION_TYPES {
  NFUP = 'NFUP',
  TURP = 'TURP',
  SUBD = 'SUBD',
}

class PdfTemplate {
  templateName: string;
  payload: any;
}

const NO_DATA = 'No Data';

@Injectable()
export class GenerateSubmissionDocumentService {
  constructor(
    private documentGenerationService: CdogsService,
    @Inject(forwardRef(() => ApplicationSubmissionService))
    private applicationSubmissionService: ApplicationSubmissionService,
    private localGovernmentService: ApplicationLocalGovernmentService,
    private applicationService: ApplicationService,
    private parcelService: ApplicationParcelService,
    @Inject(forwardRef(() => ApplicationOwnerService))
    private ownerService: ApplicationOwnerService,
    private applicationDocumentService: ApplicationDocumentService,
  ) {}

  async generate(fileNumber: string, user: User) {
    const submission =
      await this.applicationSubmissionService.verifyAccessByFileId(
        fileNumber,
        user,
      );

    const template = await this.getPdfTemplateBySubmissionType(submission);

    const pdf = await this.documentGenerationService.generateDocument(
      `${fileNumber}_submission_Date_Time`,
      `${config.get<string>('CDOGS.TEMPLATE_FOLDER')}/${template.templateName}`,
      template.payload,
    );

    return pdf;
  }

  private async getPdfTemplateBySubmissionType(
    submission: ApplicationSubmission,
  ): Promise<PdfTemplate> {
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
      case APPLICATION_SUBMISSION_TYPES.TURP:
        payload = this.populateTurData(payload, submission, documents);
        return { payload, templateName: 'tur-submission-template.docx' };
      case APPLICATION_SUBMISSION_TYPES.SUBD:
        payload = this.populateSubdData(payload, submission, documents);
        return { payload, templateName: 'subd-submission-template.docx' };
      default:
        throw new ServiceNotFoundException(
          `Could not find template for application submission type ${submission.typeCode}`,
        );
    }
  }

  private async prepareSubmissionPdfData(
    submission: ApplicationSubmission,
    documents: ApplicationDocument[],
  ) {
    const application = await this.applicationService.getOrFail(
      submission.fileNumber,
    );

    let localGovernment;
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
        !e.typeCode ||
        [
          DOCUMENT_TYPE.PHOTOGRAPH,
          DOCUMENT_TYPE.PROFESSIONAL_REPORT,
          DOCUMENT_TYPE.OTHER,
        ].includes((e.typeCode ?? 'undefined') as DOCUMENT_TYPE),
    );

    const data = {
      noData: 'No Data',
      generatedDateTime: dayjs
        .tz(new Date(), 'Canada/Pacific')
        .format('MMM DD, YYYY hh:mm:ss Z'),

      fileNumber: submission.fileNumber,
      localGovernment: localGovernment?.name,
      status: submission.status,
      applicant: submission.applicant,
      primaryContact: ['INDV', 'ORGZ'].includes(
        primaryContact?.type.code ?? 'NULL',
      )
        ? `${primaryContact?.firstName} ${primaryContact?.lastName}`
        : primaryContact?.organizationName,

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

      // Other attachments
      otherAttachments: otherDocuments.map((e) => ({
        type: e.type?.description ?? '',
        description: e.description ?? '',
        name: e.document.fileName,
        noData: NO_DATA,
      })),

      applicationTypePortalLabel: application?.type.portalLabel,
      parcels: this.mapParcelsWithOwners(
        parcels.filter((e) => e.parcelType === PARCEL_TYPE.APPLICATION),
      ),
      otherParcels: this.mapParcelsWithOwners(
        parcels.filter((e) => e.parcelType === PARCEL_TYPE.OTHER),
      ),
    };

    return data;
  }

  private mapParcelsWithOwners(parcels: ApplicationParcel[]) {
    return parcels.map((e) => ({
      ...e,
      noData: NO_DATA,
      purchasedDate: e.purchasedDate ? e.purchasedDate : undefined,
      certificateOfTitle: e.certificateOfTitle?.document.fileName,
      ownershipType: e.ownershipType?.label,
      owners: e.owners.map((o) => ({
        ...o,
        noData: NO_DATA,
        name:
          o.type.code === 'INDV'
            ? `${o.firstName} ${o.lastName}`
            : o.organizationName,
        corporateSummary: o.corporateSummary?.document.fileName,
      })),
    }));
  }

  private populateNfuData(pdfData: any, submission: ApplicationSubmission) {
    return {
      ...pdfData,

      // NFU Proposal
      nfuHectares: submission.nfuHectares,
      nfuPurpose: submission.nfuPurpose,
      nfuOutsideLands: submission.nfuOutsideLands,
      nfuAgricultureSupport: submission.nfuAgricultureSupport,
      nfuWillImportFill: submission.nfuWillImportFill,
      // NFU Proposal => Soil and Fill
      nfuFillTypeDescription: submission.nfuFillTypeDescription,
      nfuFillOriginDescription: submission.nfuFillOriginDescription,
      nfuTotalFillPlacement: submission.nfuTotalFillPlacement,
      nfuMaxFillDepth: submission.nfuMaxFillDepth,
      nfuFillVolume: submission.nfuFillVolume,
      nfuProjectDurationAmount: submission.nfuProjectDurationAmount,
      nfuProjectDurationUnit: submission.nfuProjectDurationUnit,
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
    const proposalMap = documents.filter(
      (document) => document.type?.code === DOCUMENT_TYPE.PROPOSAL_MAP,
    );

    pdfData = {
      ...pdfData,

      // TUR Proposal
      turPurpose: submission.turPurpose,
      turAgriculturalActivities: submission.turAgriculturalActivities,
      turReduceNegativeImpacts: submission.turReduceNegativeImpacts,
      turOutsideLands: submission.turOutsideLands,
      turTotalCorridorArea: submission.turTotalCorridorArea,
      servingNotice: servingNotice.find((d) => d)?.document.fileName,
      proposalMap: proposalMap.find((d) => d)?.document.fileName,
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
    const proposalMap = documents.filter(
      (document) => document.type?.code === DOCUMENT_TYPE.PROPOSAL_MAP,
    );

    pdfData = {
      ...pdfData,

      // SUBD Proposal
      subdPurpose: submission.subdPurpose,
      subdSuitability: submission.subdSuitability,
      subdAgricultureSupport: submission.subdAgricultureSupport,
      subdIsHomeSiteSeverance: this.formatBooleanToYesNoString(
        submission.subdIsHomeSiteSeverance,
      ),
      subdProposedLots: submission.subdProposedLots.map((lot, index) => ({
        ...lot,
        index: index + 1,
      })),
      homesiteSeverance: homesiteSeverance.map((d) => d.document),
      proposalMap: proposalMap.find((d) => d)?.document.fileName,
    };

    return pdfData;
  }

  private formatBooleanToYesNoString = (val?: boolean | null) => {
    switch (val) {
      case true:
        return 'Yes';
      case false:
        return 'No';
      default:
        return undefined;
    }
  };
}
