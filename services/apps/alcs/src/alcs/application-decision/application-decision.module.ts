import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { ApplicationDecisionV1Module } from './application-decision-v1/application-decision-v1.module';
import { ApplicationDecisionV2Module } from './application-decision-v2/application-decision-v2.module';

@Module({
  imports: [
    ApplicationDecisionV1Module,
    ApplicationDecisionV2Module,
    RouterModule.register([
      { path: 'alcs', module: ApplicationDecisionV1Module },
      { path: 'alcs/v2', module: ApplicationDecisionV2Module },
    ]),
  ],
  exports: [ApplicationDecisionV1Module, ApplicationDecisionV2Module],
})
export class ApplicationDecisionModule {}
