import { Global, Module } from '@nestjs/common';
import * as config from 'config';

export const CONFIG_TOKEN = 'node-config';

export const configProvider = {
  provide: CONFIG_TOKEN,
  useValue: config,
};
export type IConfig = config.IConfig;

@Global()
@Module({
  providers: [configProvider],
  exports: [configProvider],
})
export class ConfigModule {}
