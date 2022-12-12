import { HttpExceptionFilter } from '@app/common/exceptions/exception.filter';
import fastifyHelmet from '@fastify/helmet';
import fastifyMultipart from '@fastify/multipart';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import * as config from 'config';
import { Logger } from 'nestjs-pino';
import { install } from 'source-map-support';
import { PortalModule } from './portal.module';

const registerHelmet = async (app: NestFastifyApplication) => {
  await app.register(fastifyHelmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: [`'self'`, config.get<string>('KEYCLOAK.AUTH_SERVER')],
        styleSrc: [
          `'self'`,
          `'unsafe-inline'`,
          'cdn.jsdelivr.net',
          'fonts.googleapis.com',
        ],
        fontSrc: [`'self'`, 'fonts.gstatic.com'],
        imgSrc: [`'self'`, 'data:', 'cdn.jsdelivr.net'],
        scriptSrc: [`'self'`, `https: 'unsafe-inline'`, `cdn.jsdelivr.net`],
      },
    },
  });
};

const registerGlobalFilters = (app: NestFastifyApplication) => {
  app.useGlobalFilters(new HttpExceptionFilter(app.get(Logger)));
};

const registerCors = (app: NestFastifyApplication) => {
  app.enableCors({
    origin: [
      config.get<string>('PORTAL.BASE_URL'),
      config.get<string>('KEYCLOAK.AUTH_SERVER'),
      config.get<string>('PORTAL.FRONTEND_ROOT'),
    ],
  });
};

const registerPipes = (app: NestFastifyApplication) => {
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );
};

const registerMultiPart = async (app: NestFastifyApplication) => {
  await app.register(fastifyMultipart, {
    limits: {
      fieldNameSize: 100, // Max field name size in bytes
      fieldSize: 100, // Max field value size in bytes
      fields: 10, // Max number of non-file fields
      fileSize: config.get<number>('STORAGE.MAX_FILE_SIZE'), // For multipart forms, the max file size in bytes
      files: 1, // Max number of file fields
      headerPairs: 2000, // Max number of header key=>value pairs
    },
  });
};

async function bootstrap() {
  // fastify
  const app = await NestFactory.create<NestFastifyApplication>(
    PortalModule,
    new FastifyAdapter(),
    {
      bufferLogs: true,
    },
  );
  app.useLogger(app.get(Logger));

  const port: number = config.get<number>('PORTAL.PORT');
  if (config.get<string>('PORTAL.API_PREFIX')) {
    app.setGlobalPrefix(config.get<string>('PORTAL.API_PREFIX'), {
      exclude: [''],
    });
  }

  registerCors(app);
  await registerHelmet(app);
  registerGlobalFilters(app);
  registerPipes(app);
  await registerMultiPart(app);

  // start app n port
  await app.listen(port, '0.0.0.0', () => {
    console.log('[WEB]', config.get<string>('PORTAL.BASE_URL'));
  });
}

install();
bootstrap();
