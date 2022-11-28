import { Inject, Injectable } from '@nestjs/common';
import { v4 } from 'uuid';
import { CONFIG_TOKEN, IConfig } from '../../common/config/config.module';

@Injectable()
export class LocalGovernmentService {
  constructor(@Inject(CONFIG_TOKEN) private config: IConfig) {}

  async get() {
    //TODO: Call out to ALCS
    return [
      {
        uuid: v4(),
        name: 'City of Azgard',
      },
    ];
  }
}
