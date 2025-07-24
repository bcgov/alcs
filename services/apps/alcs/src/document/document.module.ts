import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClamAntivirusModule } from '../clamav/clam-antivirus.module';
import { DocumentCode } from './document-code.entity';
import { Document } from './document.entity';
import { DocumentService } from './document.service';
import { DocumentProfile } from './document.automapper.profile';

@Module({
  imports: [TypeOrmModule.forFeature([Document, DocumentCode]), ClamAntivirusModule],
  providers: [DocumentService, DocumentProfile],
  exports: [DocumentService],
})
export class DocumentModule {}
