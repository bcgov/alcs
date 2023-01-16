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
  applicationReview?: ApplicationReviewGrpc;
}

export class ApplicationDocumentGrpc {
  type: string;
  documentUuid: string;
}

export class ApplicationReviewGrpc {
  localGovernmentFileNumber: string;
  firstName: string;
  lastName: string;
  position: string;
  department: string;
  phoneNumber: string;
  email: string;
  isOCPDesignation: boolean;
  OCPBylawName: string | null;
  OCPDesignation: string | null;
  OCPConsistent: boolean | null;
  isSubjectToZoning: boolean;
  zoningBylawName: string | null;
  zoningDesignation: string | null;
  zoningMinimumLotSize: string | null;
  isZoningConsistent: boolean | null;
  isAuthorized: boolean;
}

// Protobuf does not allow method without parameters so the only way is to specify interface without properties
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ApplicationFileNumberGenerateGrpcRequest {}

export interface ApplicationFileNumberGenerateGrpcResponse {
  fileNumber: string;
}
