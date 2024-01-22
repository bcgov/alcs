import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClamAntivirusModule } from '../clamav/clam-antivirus.module';
import { DocumentCode } from './document-code.entity';
import { Document } from './document.entity';
import { DocumentService } from './document.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Document, DocumentCode]),
    ClamAntivirusModule,
  ],
  providers: [DocumentService],
  exports: [DocumentService],
})
export class DocumentModule {}
