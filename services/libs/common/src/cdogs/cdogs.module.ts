import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { CdogsService } from './cdogs.service';

@Module({
  imports: [HttpModule],
  providers: [CdogsService],
  exports: [CdogsService],
})
export class CdogsModule {}
