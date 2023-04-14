import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailStatus } from './email-status.entity';
import { EmailService } from './email.service';

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([EmailStatus])],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
