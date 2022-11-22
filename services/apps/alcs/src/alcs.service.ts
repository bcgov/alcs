import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { HealthCheckDto } from './healthcheck/healthcheck.dto';
import { HealthCheck } from './healthcheck/healthcheck.entity';

@Injectable()
export class AlcsService {
  private logger: Logger = new Logger(AlcsService.name);

  constructor(
    @InjectRepository(HealthCheck)
    private healthCheckRepository: Repository<HealthCheck>,
  ) {}

  private async canReadDb(): Promise<boolean> {
    try {
      await this.healthCheckRepository.findOne({
        where: { updateDate: Not(IsNull()) },
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
          where: { updateDate: Not(IsNull()) },
        })) || new HealthCheck();

      healthCheck.updateDate = BigInt(Date.now()).toString();

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
