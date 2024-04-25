import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import winston from 'winston';
import { ApplicationImportService } from '../alcs/import/application-import.service';
import { NoticeOfIntentImportService } from '../alcs/import/noi-import.service';
import { MainModule } from '../main.module';

export async function importApplications(logger: winston.Logger) {
  const app = await NestFactory.createApplicationContext(MainModule, {
    bufferLogs: false,
    logger,
  });

  await app.init();

  const importService = app.get(ApplicationImportService);
  await importService.importCsv();
  process.exit(0);
}

export async function importNOIs() {
  const app = await NestFactory.createApplicationContext(MainModule, {
    bufferLogs: false,
  });
  app.useLogger(app.get(Logger));

  await app.init();

  const importService = app.get(NoticeOfIntentImportService);
  await importService.importNoiCsv();
  process.exit(0);
}
