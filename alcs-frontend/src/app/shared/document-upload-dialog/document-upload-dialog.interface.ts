import { DocumentTypeDto } from '../document/document.dto';
import { CreateDocumentDto, UpdateDocumentDto } from './document-upload-dialog.dto';

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
  fetchTypes(): Promise<DocumentTypeDto[]>;
  delete(uuid: string): Promise<Object>;
}
