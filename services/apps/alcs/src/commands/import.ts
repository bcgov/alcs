import { NestFactory } from '@nestjs/core';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { Logger } from 'nestjs-pino';
import { MainModule } from '../main.module';
import { ImportService } from '../alcs/import/import.service';

export async function importApplications() {
  const app = await NestFactory.create<NestFastifyApplication>(MainModule, {
    bufferLogs: false,
  });
  app.useLogger(app.get(Logger));

  await app.init();

  const importService = app.get(ImportService);
  await importService.importCsv();
  process.exit(0);
}
