import fastifyHelmet from '@fastify/helmet';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as config from 'config';
import { HttpExceptionFilter } from './common/exceptions/exception.filter';
import { Logger } from '@nestjs/common';

const registerSwagger = (app: NestFastifyApplication) => {
  // swagger
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
  app.useGlobalFilters(new HttpExceptionFilter(new Logger('Global')));
};

const registerCors = (app: NestFastifyApplication) => {
  app.enableCors({
    origin: [
      config.get<string>('BASE_URL'),
      config.get<string>('KEYCLOAK.AUTH_SERVER'),
    ],
  });
};

async function bootstrap() {
  // fastify
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: { level: config.get<string>('LOG_LEVEL') },
    }),
  );

  // config variables
  const port: number = config.get<number>('PORT');

  registerCors(app);
  registerSwagger(app);
  await registerHelmet(app);
  registerGlobalFilters(app);

  // start app n port
  await app.listen(port, '0.0.0.0', () => {
    console.log('[WEB]', config.get<string>('BASE_URL'));
  });
}
bootstrap();
