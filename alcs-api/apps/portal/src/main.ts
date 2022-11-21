import fastifyHelmet from '@fastify/helmet';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import * as config from 'config';
import fastify from 'fastify';
import { Logger } from 'nestjs-pino';
import { HttpExceptionFilter } from './common/exceptions/exception.filter';
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

async function bootstrap() {
  //TODO: Security workaround for fastify, fixed in fastify 4.8.1+
  const fastifyInstance = fastify();
  // @ts-ignore
  const badNames = Object.getOwnPropertyNames({}.__proto__);
  fastifyInstance.addHook('onRequest', async (req, reply) => {
    for (const badName of badNames) {
      const contentType = req.headers['content-type'];
      if (contentType && contentType.includes(badName)) {
        reply.code(415);
        throw new Error('Content type not supported');
      }
    }
  });

  // fastify
  const app = await NestFactory.create<NestFastifyApplication>(
    PortalModule,
    new FastifyAdapter(fastifyInstance),
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

  // start app n port
  await app.listen(port, '0.0.0.0', () => {
    console.log('[WEB]', config.get<string>('PORTAL.BASE_URL'));
  });
}

bootstrap();
