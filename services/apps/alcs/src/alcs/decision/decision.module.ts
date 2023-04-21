import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { DecisionV1Module } from './decision-v1/decision-v1.module';
import { DecisionV2Module } from './decision-v2/decision-v2.module';

@Module({
  imports: [
    DecisionV1Module,
    DecisionV2Module,
    RouterModule.register([
      { path: 'alcs', module: DecisionV1Module },
      { path: 'alcs', module: DecisionV2Module },
    ]),
  ],
  exports: [DecisionV1Module, DecisionV2Module],
})
export class DecisionModule {}
