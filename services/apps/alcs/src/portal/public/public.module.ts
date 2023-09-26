import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { PublicSearchModule } from './search/public-search.module';

@Module({
  imports: [
    PublicSearchModule,
    RouterModule.register([{ path: 'public', module: PublicSearchModule }]),
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class PublicModule {}
