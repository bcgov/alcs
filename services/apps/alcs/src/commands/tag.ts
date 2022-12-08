import { NestFactory } from '@nestjs/core';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { Logger } from 'nestjs-pino';
import { AlcsModule } from '../alcs.module';
import { DocumentService } from '../document/document.service';

export async function applyDefaultDocumentTags() {
  const app = await NestFactory.create<NestFastifyApplication>(AlcsModule, {
    bufferLogs: false,
  });
  app.useLogger(app.get(Logger));

  await app.init();

  const documentService = app.get(DocumentService);
  await documentService.applyDefaultTags();
  process.exit(0);
}
