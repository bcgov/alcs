import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeormConfigService } from './providers/typeormconfig/typeorm.service';

@Module({
  imports: [TypeOrmModule.forRootAsync({ useClass: TypeormConfigService })],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
