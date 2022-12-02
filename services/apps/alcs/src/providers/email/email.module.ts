import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { EmailService } from './email.service';

@Module({
  imports: [HttpModule],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
