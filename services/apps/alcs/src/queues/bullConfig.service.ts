import { CONFIG_TOKEN } from '@app/common/config/config.module';
import {
  BullModuleOptions,
  SharedBullConfigurationFactory,
} from '@nestjs/bull';
import { Inject, Injectable } from '@nestjs/common';
import { IConfig } from 'config';

@Injectable()
export class BullConfigService implements SharedBullConfigurationFactory {
  constructor(@Inject(CONFIG_TOKEN) private config: IConfig) {}

  createSharedConfiguration(): BullModuleOptions {
    return {
      url: this.config.get<string>('REDIS.URL'),
    };
  }
}
