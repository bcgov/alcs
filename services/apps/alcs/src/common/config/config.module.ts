import { Global, Inject, Module } from '@nestjs/common';
import * as config from 'config';

export const CONFIG_TOKEN = 'node-config';

export const configProvider = {
  provide: CONFIG_TOKEN,
  useValue: config,
};

export const getConfigToken = () => CONFIG_TOKEN;
export type IConfig = config.IConfig;
export const InjectConfig = () => Inject(CONFIG_TOKEN);

@Global()
@Module({
  providers: [configProvider],
  exports: [configProvider],
})
export class ConfigModule {}
