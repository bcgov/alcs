import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ClamAVService } from './clamav.service';

@Module({
  imports: [HttpModule],
  providers: [ClamAVService],
  exports: [ClamAVService],
})
export class ClamAntivirusModule {}
