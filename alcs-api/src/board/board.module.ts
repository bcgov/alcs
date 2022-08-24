import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationModule } from '../application/application.module';
import { BoardAutomapperProfile } from '../common/automapper/board.automapper.profile';
import { BoardStatus } from './board-status.entity';
import { BoardController } from './board.controller';
import { Board } from './board.entity';
import { BoardService } from './board.service';

@Module({
  imports: [TypeOrmModule.forFeature([Board, BoardStatus]), ApplicationModule],
  controllers: [BoardController],
  providers: [BoardService, BoardAutomapperProfile],
})
export class BoardModule {}
