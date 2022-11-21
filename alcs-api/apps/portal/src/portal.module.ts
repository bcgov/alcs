import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from './common/config/config.module';
import { PortalController } from './portal.controller';
import { PortalService } from './portal.service';
import { TypeormConfigService } from './providers/typeorm/typeorm.service';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({ useClass: TypeormConfigService }),
  ],
  controllers: [PortalController],
  providers: [PortalService],
})
export class PortalModule {}
