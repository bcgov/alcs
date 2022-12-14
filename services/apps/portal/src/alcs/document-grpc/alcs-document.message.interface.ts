import { IsString } from 'class-validator';

export class DocumentUploadRequestGrpc {
  @IsString()
  filePath: string;
}

export interface DocumentUploadResponseGrpc {
  uploadUrl: string;
  fileKey: string;
}

export class CreateDocumentRequestGrpc {
  uploadedByUuid?: string;

  mimeType: string;

  fileName: string;

  fileKey: string;

  source: 'ALCS' | 'Local_Government' | 'Applicant';
}

export class CreateDocumentResponseGrpc {
  alcsDocumentUuid: string;
}

export const ALCS_DOCUMENT_PROTOBUF_PACKAGE_NAME = 'alcs_document';
