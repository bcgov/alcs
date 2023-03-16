import { Module } from '@nestjs/common';
import { ApplicationModule } from '../application/application.module';
import { BoardModule } from '../board/board.module';
import { ImportService } from './import.service';

@Module({
  providers: [ImportService],
  imports: [ApplicationModule, BoardModule],
})
export class ImportModule {}
