import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { ApplicationDecisionV2Module } from './application-decision-v2/application-decision-v2.module';

@Module({
  imports: [
    ApplicationDecisionV2Module,
    RouterModule.register([
      { path: 'alcs/v2', module: ApplicationDecisionV2Module },
    ]),
  ],
  providers: [],
  exports: [ApplicationDecisionV2Module],
})
export class ApplicationDecisionModule {}
