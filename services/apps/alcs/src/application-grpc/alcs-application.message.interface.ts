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
}

export class ApplicationDocumentGrpc {
  type: string;
  documentUuid: string;
}
