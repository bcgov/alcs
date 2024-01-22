import { Inject, Injectable, Logger } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';
import { CONFIG_TOKEN, IConfig } from '../config/config.module';

@Injectable()
export class RedisService {
  private logger: Logger = new Logger(RedisService.name);
  private client: ReturnType<typeof createClient>;

  constructor(@Inject(CONFIG_TOKEN) private config: IConfig) {
    const url = `redis://:${this.config.get<string>(
      'REDIS.PASSWORD',
    )}@${this.config.get<string>('REDIS.HOST')}:${this.config.get<number>(
      'REDIS.PORT',
    )}`;

    const client = createClient({
      url,
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
