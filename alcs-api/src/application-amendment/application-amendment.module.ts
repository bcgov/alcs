import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationModule } from '../application/application.module';
import { BoardModule } from '../board/board.module';
import { CardModule } from '../card/card.module';
import { AmendmentProfile } from '../common/automapper/amendment.automapper.profile';
import { ApplicationAmendmentController } from './application-amendment.controller';
import { ApplicationAmendment } from './application-amendment.entity';
import { ApplicationAmendmentService } from './application-amendment.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ApplicationAmendment]),
    forwardRef(() => BoardModule),
    ApplicationModule,
    CardModule,
  ],
  providers: [ApplicationAmendmentService, AmendmentProfile],
  controllers: [ApplicationAmendmentController],
  exports: [ApplicationAmendmentService],
})
export class ApplicationAmendmentModule {}
