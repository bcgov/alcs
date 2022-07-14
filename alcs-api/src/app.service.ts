import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { HealthCheckDto } from './healthcheck/healthcheck.dto';
import { HealthCheck } from './healthcheck/healthcheck.entity';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(HealthCheck)
    private readonly healthCheckRepository: Repository<HealthCheck>,
  ) {}

  private async canReadDb(): Promise<boolean> {
    try {
      await this.healthCheckRepository.findOne({
        where: { UpdateDate: Not(IsNull()) },
      });

      return true;
    } catch (e) {
      console.log('[ERROR] -> AppService -> canReadDb', e);
      return false;
    }
  }

  private async canWriteDb(): Promise<boolean> {
    try {
      const healthCheck =
        (await this.healthCheckRepository.findOne({
          where: { UpdateDate: Not(IsNull()) },
        })) || new HealthCheck();

      healthCheck.UpdateDate = BigInt(new Date().getTime()).toString();

      await this.healthCheckRepository.save(healthCheck);

      return true;
    } catch (e) {
      console.log('[ERROR] -> AppService -> canWriteDb', e);
      return false;
    }
  }

  async getHealthStatus(): Promise<HealthCheckDto> {
    return {
      alive: true,
      db: {
        read: await this.canReadDb(),
        write: await this.canWriteDb(),
      },
    };
  }
}
