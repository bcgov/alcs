import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocalGovernment } from './local-government.entity';
import { LocalGovernmentService } from './local-government.service';

@Module({
  imports: [TypeOrmModule.forFeature([LocalGovernment])],
  providers: [LocalGovernmentService],
  controllers: [],
  exports: [LocalGovernmentService],
})
export class LocalGovernmentModule {}
