import { NestFactory } from '@nestjs/core';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { Logger } from 'nestjs-pino';
import { MainModule } from '../main.module';
import { DocumentService } from '../document/document.service';

export async function applyDefaultDocumentTags() {
  const app = await NestFactory.create<NestFastifyApplication>(MainModule, {
    bufferLogs: false,
  });
  app.useLogger(app.get(Logger));

  await app.init();

  const documentService = app.get(DocumentService);
  await documentService.applyDefaultTags();
  process.exit(0);
}
