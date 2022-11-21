import { Inject, Injectable } from '@nestjs/common';
import { TypeOrmOptionsFactory, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { CONFIG_TOKEN, IConfig } from '../../common/config/config.module';
import { getOrmConfig } from './orm.config';

@Injectable()
export class TypeormConfigService implements TypeOrmOptionsFactory {
  constructor(@Inject(CONFIG_TOKEN) private config: IConfig) {}

  public createTypeOrmOptions(): TypeOrmModuleOptions {
    return getOrmConfig(this.config);
  }
}
