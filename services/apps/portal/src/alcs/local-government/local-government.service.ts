import { Inject, Injectable } from '@nestjs/common';
import { CONFIG_TOKEN, IConfig } from '../../common/config/config.module';

@Injectable()
export class LocalGovernmentService {
  constructor(@Inject(CONFIG_TOKEN) private config: IConfig) {}

  async get() {
    //TODO: Call out to ALCS
    return [
      {
        uuid: 'fd4a6d5a-23ee-4b0c-959c-7d367b661d39',
        name: 'City of Azgard',
      },
    ];
  }
}
