import fastifyHelmet from '@fastify/helmet';
import fastifyMultipart from '@fastify/multipart';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as config from 'config';
import { Logger } from 'nestjs-pino';
import { install } from 'source-map-support';
import { AlcsModule } from './alcs.module';
import { generateModuleGraph } from './commands/graph';
import { importApplications } from './commands/import';
import { applyDefaultDocumentTags } from './commands/tag';
import { HttpExceptionFilter } from './common/exceptions/exception.filter';
import { grpcOptions } from './providers/grpc/grpc.options.config';

const registerSwagger = (app: NestFastifyApplication) => {
  const documentBuilderConfig = new DocumentBuilder()
    .setTitle('ALCS API')
    .setDescription('ALCS - provide explanation for ALCS')
    .setVersion('0.1')
    .addOAuth2({
      type: 'oauth2',
      flows: {
        password: {
          tokenUrl: config.get<string>('KEYCLOAK.AUTH_TOKEN_URL'),
          authorizationUrl: config.get<string>('KEYCLOAK.AUTH_SERVER_URL'),
          scopes: { openid: 'openid' },
        },
      },
    })
    .build();
  const document = SwaggerModule.createDocument(app, documentBuilderConfig);
  SwaggerModule.setup('docs', app, document);
};

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
      config.get<string>('ALCS.BASE_URL'),
      config.get<string>('KEYCLOAK.AUTH_SERVER'),
      config.get<string>('ALCS.FRONTEND_ROOT'),
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
    AlcsModule,
    new FastifyAdapter(),
    {
      bufferLogs: true,
    },
  );
  app.useLogger(app.get(Logger));

  const extraArg = process.argv[2];
  if (extraArg === 'graph') {
    await generateModuleGraph(app);
  }
  if (extraArg == 'import') {
    await importApplications();
  }
  if (extraArg == 'tagDocuments') {
    await applyDefaultDocumentTags();
  }

  // config variables
  const port: number = config.get<number>('ALCS.PORT');

  if (config.get<string>('ALCS.API_PREFIX')) {
    app.setGlobalPrefix(config.get<string>('ALCS.API_PREFIX'), {
      exclude: [''],
    });
  }

  registerCors(app);
  registerSwagger(app);
  await registerHelmet(app);
  registerGlobalFilters(app);
  await registerMultiPart(app);
  registerPipes(app);

  // microservices
  // TODO enable once openshift configuration is ready
  app.connectMicroservice<MicroserviceOptions>(grpcOptions);
  await app.startAllMicroservices();

  // start app n port
  await app.listen(port, '0.0.0.0', () => {
    console.log('[WEB]', config.get<string>('ALCS.BASE_URL'));
  });
}

install();
bootstrap();
