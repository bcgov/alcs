import { SharedBullConfigurationFactory } from '@nestjs/bullmq';
import { Inject, Injectable } from '@nestjs/common';
import { QueueOptions } from 'bullmq';
import {
  CONFIG_TOKEN,
  IConfig,
} from '../../../../libs/common/src/config/config.module';

@Injectable()
export class BullConfigService implements SharedBullConfigurationFactory {
  constructor(@Inject(CONFIG_TOKEN) private config: IConfig) {}

  createSharedConfiguration(): QueueOptions {
    return {
      connection: {
        host: this.config.get<string>('REDIS.HOST'),
        port: this.config.get<number>('REDIS.PORT'),
        password: this.config.get<string>('REDIS.PASSWORD'),
      },
    };
  }
}
