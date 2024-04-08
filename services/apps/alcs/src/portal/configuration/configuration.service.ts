import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CONFIG_VALUE,
  Configuration,
} from '../../common/entities/configuration.entity';

@Injectable()
export class ConfigurationService {
  constructor(
    @InjectRepository(Configuration)
    private configurationRepository: Repository<Configuration>,
  ) {}

  // Add test
  async getMaintenanceBanner() {
    const bannerStatus = await this.getByName(
      CONFIG_VALUE.APP_MAINTENANCE_BANNER,
    );

    const showBanner = bannerStatus?.value === 'true';
    let message: string | null = null;

    if (showBanner) {
      const bannerMessage = await this.getByName(
        CONFIG_VALUE.APP_MAINTENANCE_BANNER_MESSAGE,
      );
      message = bannerMessage?.value || null;
    }

    return { showBanner, message };
  }

  private getByName(config: CONFIG_VALUE) {
    return this.configurationRepository.findOne({
      where: {
        name: config,
      },
    });
  }
}
