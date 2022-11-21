import { NestFactory } from '@nestjs/core';
import { PortalModule } from './portal.module';

async function bootstrap() {
  const app = await NestFactory.create(PortalModule);
  await app.listen(3000);
}
bootstrap();
