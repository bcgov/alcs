import { HttpExceptionFilter } from '@app/common/exceptions/exception.filter';
import fastifyHelmet from '@fastify/helmet';
import fastifyMultipart from '@fastify/multipart';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as config from 'config';
import { S3StreamLogger } from 's3-streamlogger';
import { install } from 'source-map-support';
import * as winston from 'winston';
import { createLogger } from 'winston';
import { generateModuleGraph } from './commands/graph';
import { MainModule } from './main.module';

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
    maxAge: 3600,
    origin: [
      config.get<string>('ALCS.BASE_URL'),
      config.get<string>('KEYCLOAK.AUTH_SERVER'),
      config.get<string>('ALCS.FRONTEND_ROOT'),
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
    attachFieldsToBody: true,
    limits: {
      fieldNameSize: 100, // Max field name size in bytes
      fieldSize: 300, // Max field value size in bytes
      fields: 10, // Max number of non-file fields
      fileSize: config.get<number>('STORAGE.MAX_FILE_SIZE'), // For multipart forms, the max file size in bytes
      files: 1, // Max number of file fields
      headerPairs: 2000, // Max number of header key=>value pairs
    },
  });
};

function setupLogger() {
  const s3Stream = new S3StreamLogger({
    rotate_every: 1000 * 60 * 60 * 24, //1 Day
    folder: 'logs',
    bucket: config.get<string>('STORAGE.BUCKET'),
    name_format: '%Y-%b-%d-console.log', //https://www.npmjs.com/package/strftime
    config: {
      region: 'us-east-1',
      credentials: {
        accessKeyId: config.get('STORAGE.ACCESS_KEY'),
        secretAccessKey: config.get('STORAGE.SECRET_KEY'),
      },
      forcePathStyle: true,
      endpoint: config.get('STORAGE.URL'),
    },
  });

  const timeStampFormat = winston.format.timestamp({
    format: 'YYYY-MMM-DD HH:mm:ss',
  });

  const messageFormat = winston.format.printf((info) => {
    return `${info.timestamp} [${info.level.toUpperCase()}]${info.context ? ` [${info.context}]` : ''} ${info.message}`;
  });

  const colorFormat = winston.format.colorize({
    all: true,
    colors: {
      info: 'blue',
      debug: 'green',
      warning: 'yellow',
      error: 'red',
    },
  });

  const s3Transport = new winston.transports.Stream({
    level: config.get('LOG_LEVEL'),
    stream: s3Stream,
    format: winston.format.combine(timeStampFormat, messageFormat),
  });
  const consoleTransport = new winston.transports.Console({
    level: config.get('LOG_LEVEL'),
    format: winston.format.combine(timeStampFormat, messageFormat, colorFormat),
  });

  return createLogger({
    levels: {
      fatal: 0,
      error: 1,
      warn: 2,
      info: 3,
      http: 4,
      debug: 5,
      verbose: 6,
      log: 7,
    },
    transports:
      config.get('ENV') === 'production'
        ? [consoleTransport, s3Transport]
        : [consoleTransport],
  });
}

async function bootstrap() {
  const logger = setupLogger();

  // fastify
  const app = await NestFactory.create<NestFastifyApplication>(
    MainModule,
    new FastifyAdapter(),
    {
      bufferLogs: false,
      logger,
    },
  );
  app.useLogger(logger);

  const extraArg = process.argv[2];
  if (extraArg === 'graph') {
    await generateModuleGraph(app);
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
  // GRPC is disabled after the migration to a single service. For now, this is just an example of configuration.
  // app.connectMicroservice<MicroserviceOptions>(grpcOptions);
  // await app.startAllMicroservices();

  // start app n port
  await app.listen(port, '0.0.0.0', () => {
    console.log('[WEB]', config.get<string>('ALCS.BASE_URL'));
  });
}

install();
bootstrap();
