import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { firstValueFrom, Observable } from 'rxjs';
import { Repository } from 'typeorm';
import { DocumentUploadResponseGrpc } from '../alcs/document-grpc/alcs-document.message.interface';
import { AlcsDocumentService } from '../alcs/document-grpc/alcs-document.service';
import { Document } from './document.entity';

@Injectable()
export class DocumentService {
  constructor(
    private alcsDocumentService: AlcsDocumentService,
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
  ) {}

  async delete(document: Document) {
    const res = await firstValueFrom(
      this.alcsDocumentService.deleteExternalDocument({
        uuid: document.alcsDocumentUuid,
      }),
    );

    await this.documentRepository.delete(document.uuid);

    return res;
  }

  getDownloadUrl(uuid: string) {
    return this.alcsDocumentService.getDownloadUrl({
      uuid,
    });
  }

  getUploadUrl(filePath: string): Observable<DocumentUploadResponseGrpc> {
    return this.alcsDocumentService.getUploadUrl({ filePath });
  }
}
