import { Module } from '@nestjs/common';
import { DocumentModule } from '../../document/document.module';
import { DocumentController } from './document.controller';

@Module({
  imports: [DocumentModule],
  controllers: [DocumentController],
  providers: [],
  exports: [],
})
export class PortalDocumentModule {}
