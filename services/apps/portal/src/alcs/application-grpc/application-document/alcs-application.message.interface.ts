import { IsOptional, IsString } from 'class-validator';

export const ALCS_APPLICATION_DOCUMENT_PROTOBUF_PACKAGE_NAME =
  'alcs_application_document';

export class ApplicationAttachDocumentGrpcRequest {
  @IsString()
  type: string;

  @IsString()
  applicationFileNumber: string;

  @IsString()
  @IsOptional()
  uploadedByUuid?: string;

  @IsString()
  mimeType: string;

  @IsString()
  fileName: string;

  @IsString()
  fileKey: string;

  @IsString()
  source: 'ALCS' | 'Local_Government' | 'Applicant';
}

export class ApplicationAttachDocumentGrpcResponse {}
