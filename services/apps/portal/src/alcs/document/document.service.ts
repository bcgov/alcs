import { CONFIG_TOKEN, IConfig } from '@app/common/config/config.module';
import { MultipartFile } from '@fastify/multipart';
import { Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { v4 } from 'uuid';
import { User } from '../../user/user.entity';
import { DocumentUploadResponseGrpc } from '../document-grpc/alcs-document.message.interface';
import { AlcsDocumentService } from '../document-grpc/alcs-document.service';

@Injectable()
export class DocumentService {
  constructor(private alcsDocumentService: AlcsDocumentService) {}

  async create(filePath: string, file: MultipartFile, user: User) {
    const data = await file.toBuffer();
    return v4();
  }

  async delete(uuid: string) {
    //TODO: Call out to ALCS
  }

  async getDownloadUrl(uuid: string, openInline = false) {
    //TODO: Call out to ALCS
    return '';
  }

  getUploadUrl(filePath: string): Observable<DocumentUploadResponseGrpc> {
    return this.alcsDocumentService.getUploadUrl({ filePath });
  }
}
