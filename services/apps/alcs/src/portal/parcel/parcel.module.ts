import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParcelLookup } from './parcel-lookup.entity';
import { ParcelController } from './parcel.controller';
import { ParcelService } from './parcel.service';

@Module({
  imports: [TypeOrmModule.forFeature([ParcelLookup])],
  providers: [ParcelService],
  controllers: [ParcelController],
})
export class ParcelModule {}
