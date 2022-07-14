import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { HealthCheckDto } from './healthcheck/healthcheck.dto';
import { HealthCheck } from './healthcheck/healthcheck.entity';

@Injectable()
export class AppService {
  private readonly logger: Logger = new Logger(AppService.name);

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
      this.logger.error(`canReadDb failed: ${e.message}`, e.stack);
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
      this.logger.error(`canWriteDb failed ${e.message}`, e.stack);
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
