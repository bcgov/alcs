import {
  BullModuleOptions,
  SharedBullConfigurationFactory,
} from '@nestjs/bull';
import { Inject, Injectable } from '@nestjs/common';
import { IConfig } from 'config';
import { CONFIG_TOKEN } from '../common/config/config.module';

@Injectable()
export class BullConfigService implements SharedBullConfigurationFactory {
  constructor(@Inject(CONFIG_TOKEN) private config: IConfig) {}

  createSharedConfiguration(): BullModuleOptions {
    return {
      url: this.config.get<string>('REDIS.URL'),
    };
  }
}
