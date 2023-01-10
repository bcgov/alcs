import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlcsModule } from '../alcs/alcs.module';
import { DocumentController } from './document.controller';
import { Document } from './document.entity';
import { DocumentService } from './document.service';

@Module({
  imports: [AlcsModule, TypeOrmModule.forFeature([Document])],
  controllers: [DocumentController],
  providers: [DocumentService],
  exports: [DocumentService],
})
export class DocumentModule {}
