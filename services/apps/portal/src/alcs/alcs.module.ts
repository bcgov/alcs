import { Module } from '@nestjs/common';
import { DocumentService } from './document/document.service';

@Module({
  providers: [DocumentService],
  exports: [DocumentService],
})
export class AlcsModule {}
