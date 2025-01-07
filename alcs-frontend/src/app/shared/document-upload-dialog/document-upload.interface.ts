export interface DecisionService {
  uploadFile(decisionUuid: string, file: File): Promise<Object | undefined>;
  downloadFile(decisionUuid: string, documentUuid: string, fileName: string, isInline: boolean): Promise<void>;
  updateFile(decisionUuid: string, documentUuid: string, fileName: string): Promise<void>;
  deleteFile(decisionUuid: string, documentUuid: string): Promise<{ url: string }>;
}
