import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NoticeOfIntentProfile } from '../../common/automapper/notice-of-intent.automapper.profile';
import { ApplicationModule } from '../application/application.module';
import { BoardModule } from '../board/board.module';
import { CardModule } from '../card/card.module';
import { CodeModule } from '../code/code.module';
import { NoticeOfIntent } from './notice-of-intent.entity';
import { NoticeOfIntentService } from './notice-of-intent.service';
import { NoticeOfIntentController } from './notice-of-intent.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([NoticeOfIntent]),
    forwardRef(() => BoardModule),
    ApplicationModule,
    CardModule,
    CodeModule,
  ],
  providers: [NoticeOfIntentService, NoticeOfIntentProfile],
  controllers: [NoticeOfIntentController],
  exports: [NoticeOfIntentService],
})
export class NoticeOfIntentModule {}
