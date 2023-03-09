import { AutoMap } from '@automapper/classes';

export const ALCS_APPLICATION_PROTOBUF_PACKAGE_NAME = 'alcs_application';

export class ApplicationGrpcResponse {
  @AutoMap()
  fileNumber: string;

  @AutoMap()
  applicant: string;

  @AutoMap()
  dateSubmittedToAlc: string;

  @AutoMap()
  regionCode: string;

  @AutoMap()
  localGovernmentUuid: string;

  @AutoMap()
  typeCode: string;
}

export class ApplicationCreateGrpcRequest {
  fileNumber: string;
  applicant: string;
  typeCode: string;
  dateSubmittedToAlc: string;
  localGovernmentUuid: string;
  documents: ApplicationDocumentGrpc[];
  submittedApplication: SubmittedApplicationGrpc;
  applicationReview?: ApplicationReviewGrpc;
  statusHistory: StatusHistoryGrpc[];
}

export class ApplicationDocumentGrpc {
  type: string;
  documentUuid: string;
  description?: string;
}

export class SubmittedApplicationOwnerGrpc {
  @AutoMap()
  firstName: string;

  @AutoMap()
  lastName: string;

  @AutoMap()
  organizationName?: string;

  @AutoMap()
  phoneNumber: string;

  @AutoMap()
  email: string;

  @AutoMap()
  type: string;

  @AutoMap()
  corporateSummaryDocumentUuid?: string;
}

export class SubmittedApplicationParcelGrpc {
  @AutoMap()
  pid?: string;

  @AutoMap()
  pin?: string;

  @AutoMap()
  legalDescription: string;

  @AutoMap()
  mapAreaHectares: string;

  @AutoMap()
  purchasedDate?: number;

  @AutoMap()
  isFarm: boolean;

  @AutoMap()
  ownershipType: string;

  @AutoMap()
  crownLandOwnerType: string;

  @AutoMap()
  parcelType: string;

  @AutoMap()
  documentUuids: string[];

  @AutoMap()
  owners: SubmittedApplicationOwnerGrpc[];
}

export class SubmittedApplicationGrpc {
  @AutoMap()
  parcels: SubmittedApplicationParcelGrpc[];

  @AutoMap()
  otherParcels: SubmittedApplicationParcelGrpc[];

  @AutoMap()
  primaryContact: SubmittedApplicationOwnerGrpc;

  @AutoMap()
  parcelsAgricultureDescription: string;

  @AutoMap()
  parcelsAgricultureImprovementDescription: string;

  @AutoMap()
  parcelsNonAgricultureUseDescription: string;

  @AutoMap()
  northLandUseType: string;

  @AutoMap()
  northLandUseTypeDescription: string;

  @AutoMap()
  eastLandUseType: string;

  @AutoMap()
  eastLandUseTypeDescription: string;

  @AutoMap()
  southLandUseType: string;

  @AutoMap()
  southLandUseTypeDescription: string;

  @AutoMap()
  westLandUseType: string;

  @AutoMap()
  westLandUseTypeDescription: string;

  //NFU Data
  @AutoMap()
  nfuHectares?: string;

  @AutoMap()
  nfuPurpose?: string;

  @AutoMap()
  nfuOutsideLands?: string;

  @AutoMap()
  nfuAgricultureSupport?: string;

  @AutoMap()
  nfuWillImportFill?: boolean;

  @AutoMap()
  nfuTotalFillPlacement?: string;

  @AutoMap()
  nfuMaxFillDepth?: string;

  @AutoMap()
  nfuFillVolume?: string;

  @AutoMap()
  nfuProjectDurationAmount?: string;

  @AutoMap()
  nfuProjectDurationUnit?: string;

  @AutoMap()
  nfuFillTypeDescription?: string;

  @AutoMap()
  nfuFillOriginDescription?: string;
}

export class ApplicationReviewGrpc {
  @AutoMap()
  localGovernmentFileNumber: string;

  @AutoMap()
  firstName: string;

  @AutoMap()
  lastName: string;

  @AutoMap()
  position: string;

  @AutoMap()
  department: string;

  @AutoMap()
  phoneNumber: string;

  @AutoMap()
  email: string;

  @AutoMap(() => Boolean)
  isOCPDesignation: boolean | null;

  @AutoMap(() => String)
  OCPBylawName: string | null;

  @AutoMap(() => String)
  OCPDesignation: string | null;

  @AutoMap(() => Boolean)
  OCPConsistent: boolean | null;

  @AutoMap(() => Boolean)
  isSubjectToZoning: boolean | null;

  @AutoMap(() => String)
  zoningBylawName: string | null;

  @AutoMap(() => String)
  zoningDesignation: string | null;

  @AutoMap(() => String)
  zoningMinimumLotSize: string | null;

  @AutoMap(() => Boolean)
  isZoningConsistent: boolean | null;

  @AutoMap(() => Boolean)
  isAuthorized: boolean | null;
}

export class StatusHistoryGrpc {
  type: 'status_change';
  label: string;
  description: string;
  time: string;
}

// Protobuf does not allow method without parameters so the only way is to specify interface without properties
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ApplicationFileNumberGenerateGrpcRequest {}

export interface ApplicationFileNumberGenerateGrpcResponse {
  fileNumber: string;
}
