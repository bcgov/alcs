import { Inject, Injectable, Logger } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';
import { CONFIG_TOKEN, IConfig } from '../config/config.module';

@Injectable()
export class RedisService {
  private logger: Logger = new Logger(RedisService.name);
  private client: ReturnType<typeof createClient>;

  constructor(@Inject(CONFIG_TOKEN) private config: IConfig) {
    const client = createClient({
      url: this.config.get<string>('REDIS.URL'),
    });
    client.on('error', (err) => this.logger.error('Redis Client Error', err));
    client.connect().then(() => {
      this.client = client;
      this.logger.debug('Redis Connected');
    });
  }

  getClient() {
    return this.client as RedisClientType;
  }
}
