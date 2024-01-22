import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileViewed } from './file-viewed.entity';
import { TrackingService } from './tracking.service';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([FileViewed])],
  providers: [TrackingService],
  exports: [TrackingService],
})
export class TrackingModule {}
