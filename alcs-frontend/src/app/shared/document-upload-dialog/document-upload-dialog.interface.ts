import { Section } from '../../services/compliance-and-enforcement/documents/document.service';
import { DOCUMENT_SOURCE, DOCUMENT_TYPE, DocumentTypeDto } from '../document/document.dto';
import { VisibilityGroup } from './document-upload-dialog.component';
import {
  CreateDocumentDto,
  DocumentDto,
  SelectableParcelDto,
  SubmissionOwnersDto,
  UpdateDocumentDto,
} from './document-upload-dialog.dto';

export interface DocumentTypeConfig {
  visibilityGroups: VisibilityGroup[];
  allowsFileEdit: boolean;
}

export interface DocumentUploadDialogOptions {
  allowedVisibilityFlags?: ('A' | 'C' | 'G' | 'P')[];
  allowsFileEdit?: boolean;
  documentTypeOverrides?: Partial<Record<DOCUMENT_TYPE, DocumentTypeConfig>>;
  allowedDocumentSources?: DOCUMENT_SOURCE[];
  defaultDocumentSource?: DOCUMENT_SOURCE;
  allowedDocumentTypes?: DOCUMENT_TYPE[];
  defaultDocumentType?: DOCUMENT_TYPE;
  section?: Section;
  chronologyEntryUuid?: string;
}

export interface DocumentUploadDialogData extends DocumentUploadDialogOptions {
  fileId: string;
  decisionUuid?: string;
  existingDocument?: DocumentDto;
  decisionService?: DecisionService;
  documentService?: DocumentService;
  parcelService?: ParcelFetchingService;
  submissionService?: SubmissionFetchingService;
  fixedParcel?: SelectableParcelDto;
}

export interface DecisionService {
  uploadFile(decisionUuid: string, file: File): Promise<Object | undefined>;
  downloadFile(decisionUuid: string, documentUuid: string, fileName: string, isInline: boolean): Promise<void>;
  updateFile(decisionUuid: string, documentUuid: string, fileName: string): Promise<void>;
  deleteFile(decisionUuid: string, documentUuid: string): Promise<{ url: string }>;
}

export interface DocumentService {
  update(uuid: string, updateDto: UpdateDocumentDto): Promise<Object>;
  upload(fileNumber: string, createDto: CreateDocumentDto): Promise<Object | undefined>;
  download(uuid: string, fileName: string, isInline: boolean): Promise<void>;
  fetchTypes(allowedCodes?: DOCUMENT_TYPE[]): Promise<DocumentTypeDto[]>;
  delete(uuid: string): Promise<Object>;
}

export interface ParcelFetchingService {
  fetchParcels(fileNumber: string): Promise<SelectableParcelDto[]>;
}

export interface SubmissionFetchingService {
  fetchSubmission(fileNumber: string): Promise<SubmissionOwnersDto>;
}
