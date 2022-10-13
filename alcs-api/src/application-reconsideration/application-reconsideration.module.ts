import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationModule } from '../application/application.module';
import { BoardModule } from '../board/board.module';
import { CardModule } from '../card/card.module';
import { CodeModule } from '../code/code.module';
import { ReconsiderationProfile } from '../common/automapper/reconsideration.automapper.profile';
import { ApplicationReconsiderationController } from './application-reconsideration.controller';
import { ApplicationReconsideration } from './application-reconsideration.entity';
import { ApplicationReconsiderationService } from './application-reconsideration.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ApplicationReconsideration]),
    BoardModule,
    ApplicationModule,
    CardModule,
    CodeModule,
  ],
  providers: [ApplicationReconsiderationService, ReconsiderationProfile],
  controllers: [ApplicationReconsiderationController],
  exports: [ApplicationReconsiderationService],
})
export class ApplicationReconsiderationModule {}
