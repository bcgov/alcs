import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Application } from '../application/application.entity';
import { ApplicationType } from '../code/application-code/application-type/application-type.entity';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';

@Module({
  imports: [TypeOrmModule.forFeature([Application, ApplicationType])],
  providers: [SearchService],
  controllers: [SearchController],
})
export class SearchModule {}
