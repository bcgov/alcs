import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Application } from '../alcs/application/application.entity';
import { Covenant } from '../alcs/covenant/covenant.entity';
import { NoticeOfIntent } from '../alcs/notice-of-intent/notice-of-intent.entity';
import { FileNumberService } from './file-number.service';

@Module({
  imports: [TypeOrmModule.forFeature([Covenant, Application, NoticeOfIntent])],
  providers: [FileNumberService],
  exports: [FileNumberService],
})
export class FileNumberModule {}
