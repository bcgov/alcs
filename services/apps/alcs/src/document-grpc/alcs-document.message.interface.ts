import { IsString } from 'class-validator';

export class DocumentUploadRequestGrpc {
  @IsString()
  filePath: string;
}

export interface DocumentUploadResponseGrpc {
  uploadUrl: string;
  fileKey: string;
}

export const ALCS_DOCUMENT_PROTOBUF_PACKAGE_NAME = 'alcs_document';
