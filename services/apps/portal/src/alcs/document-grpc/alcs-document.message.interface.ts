import { IsString } from 'class-validator';

export class DocumentUploadRequestGrpc {
  @IsString()
  filePath: string;
}

export interface DocumentUploadResponseGrpc {
  uploadUrl: string;
  fileKey: string;
}

export class CreateDocumentGrpcRequest {
  uploadedByUuid?: string;

  mimeType: string;

  fileName: string;

  fileKey: string;

  source: 'ALCS' | 'Local_Government' | 'Applicant';
}

export class CreateDocumentGrpcResponse {
  alcsDocumentUuid: string;
}

export const ALCS_DOCUMENT_PROTOBUF_PACKAGE_NAME = 'alcs_document';
