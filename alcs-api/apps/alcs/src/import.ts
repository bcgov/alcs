import { NestFactory } from '@nestjs/core';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { Logger } from 'nestjs-pino';
import { AlcsModule } from './alcs.module';
import { ImportService } from './import/import.service';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AlcsModule, {
    bufferLogs: false,
  });
  app.useLogger(app.get(Logger));

  await app.init();

  const importService = app.get(ImportService);
  await importService.importCsv();
  process.exit(0);
}

bootstrap();
