import { Module } from '@nestjs/common';
import { AlcsDocumentService } from './alcs-document.service';

@Module({
  providers: [AlcsDocumentService],
  exports: [AlcsDocumentService],
})
export class AlcsDocumentModule {}
