import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CONFIG_VALUE,
  Configuration,
} from '../../../common/entities/configuration.entity';

@Injectable()
export class ConfigurationService {
  constructor(
    @InjectRepository(Configuration)
    private configurationRepository: Repository<Configuration>,
  ) {}

  async setConfigurationValue(name: CONFIG_VALUE, value: string) {
    return await this.configurationRepository.upsert(
      new Configuration({
        name,
        value,
      }),
      ['name'],
    );
  }

  list() {
    return this.configurationRepository.find({
      select: {
        name: true,
        value: true,
      },
    });
  }

  // TODO: Update to retrieve both banner message and status
  getMaintenaceBanner() {
    return this.configurationRepository.findOne({
      where: {
        name: CONFIG_VALUE.APP_MAINTENANCE_BANNER,
      },
    });
  }
}
