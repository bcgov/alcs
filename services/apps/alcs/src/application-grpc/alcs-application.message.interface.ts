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
  statusHistory: StatusHistoryGrpc[];
}

export class ApplicationDocumentGrpc {
  type: string;
  documentUuid: string;
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
