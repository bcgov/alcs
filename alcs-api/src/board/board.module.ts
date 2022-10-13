import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationReconsiderationModule } from '../application-reconsideration/application-reconsideration.module';
import { ApplicationModule } from '../application/application.module';
import { CardModule } from '../card/card.module';
import { BoardAutomapperProfile } from '../common/automapper/board.automapper.profile';
import { BoardStatus } from './board-status.entity';
import { BoardController } from './board.controller';
import { Board } from './board.entity';
import { BoardService } from './board.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Board, BoardStatus]),
    ApplicationModule,
    CardModule,
    forwardRef(() => ApplicationReconsiderationModule),
  ],
  controllers: [BoardController],
  providers: [BoardService, BoardAutomapperProfile],
  exports: [BoardService],
})
export class BoardModule {}
