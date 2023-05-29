import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CovenantProfile } from '../../common/automapper/covenant.automapper.profile';
import { FileNumberModule } from '../../file-number/file-number.module';
import { BoardModule } from '../board/board.module';
import { CardModule } from '../card/card.module';
import { CovenantController } from './covenant.controller';
import { Covenant } from './covenant.entity';
import { CovenantService } from './covenant.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Covenant]),
    forwardRef(() => BoardModule),
    CardModule,
    FileNumberModule,
  ],
  providers: [CovenantService, CovenantProfile],
  controllers: [CovenantController],
  exports: [CovenantService],
})
export class CovenantModule {}
