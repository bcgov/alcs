import { Module } from '@nestjs/common';
import { AlcsModule } from '../alcs/alcs.module';
import { DocumentController } from './document.controller';

@Module({
  imports: [AlcsModule],
  controllers: [DocumentController],
})
export class DocumentModule {}
