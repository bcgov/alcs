import { Module } from '@nestjs/common';
import { IncomingFileController } from './incoming-file.controller';
import { ApplicationModule } from '../application/application.module';

@Module({
  imports: [ApplicationModule],
  providers: [],
  controllers: [IncomingFileController],
  exports: [],
})
export class IncomingFileModule {}
