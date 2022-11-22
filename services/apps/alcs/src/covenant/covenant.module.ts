import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationModule } from '../application/application.module';
import { BoardModule } from '../board/board.module';
import { CardModule } from '../card/card.module';
import { CodeModule } from '../code/code.module';
import { CovenantProfile } from '../common/automapper/covenant.automapper.profile';
import { CovenantController } from './covenant.controller';
import { Covenant } from './covenant.entity';
import { CovenantService } from './covenant.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Covenant]),
    forwardRef(() => BoardModule),
    ApplicationModule,
    CardModule,
    CodeModule,
  ],
  providers: [CovenantService, CovenantProfile],
  controllers: [CovenantController],
  exports: [CovenantService],
})
export class CovenantModule {}
