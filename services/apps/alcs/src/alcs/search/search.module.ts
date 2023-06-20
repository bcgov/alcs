import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationProfile } from '../../common/automapper/application.automapper.profile';
import { ApplicationLocalGovernment } from '../application/application-code/application-local-government/application-local-government.entity';
import { Application } from '../application/application.entity';
import { Covenant } from '../covenant/covenant.entity';
import { NoticeOfIntent } from '../notice-of-intent/notice-of-intent.entity';
import { PlanningReview } from '../planning-review/planning-review.entity';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Application,
      NoticeOfIntent,
      PlanningReview,
      Covenant,
      ApplicationLocalGovernment,
    ]),
  ],
  providers: [SearchService, ApplicationProfile],
  controllers: [SearchController],
})
export class SearchModule {}
