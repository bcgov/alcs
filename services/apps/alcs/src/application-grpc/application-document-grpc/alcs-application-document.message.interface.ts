export const ALCS_APPLICATION_DOCUMENT_PROTOBUF_PACKAGE_NAME =
  'alcs_application_document';

export class ApplicationAttachDocumentGrpcRequest {
  type: string;

  applicationFileNumber: string;

  uploadedByUuid?: string;

  mimeType: string;

  fileName: string;

  fileKey: string;

  source: 'ALCS' | 'Local_Government' | 'Applicant';
}

export class ApplicationAttachDocumentGrpcResponse {}
