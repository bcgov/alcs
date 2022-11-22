import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ServiceNotFoundException,
  ServiceValidationException,
} from '../../common/exceptions/base.exception';
import { ApplicationPaused } from '../application-paused.entity';

@Injectable()
export class ApplicationPausedService {
  constructor(
    @InjectRepository(ApplicationPaused)
    private appPausedRepository: Repository<ApplicationPaused>,
  ) {}

  get(uuid) {
    return this.appPausedRepository.findOne({
      where: { uuid },
    });
  }

  remove(uuid: string) {
    return this.appPausedRepository.delete(uuid);
  }

  async createOrUpdate(pause: Partial<ApplicationPaused>) {
    let existingPause;
    if (pause.uuid) {
      existingPause = await this.get(pause.uuid);
      if (!existingPause) {
        throw new ServiceNotFoundException(`Pause not found ${pause.uuid}`);
      }
    }

    if (pause.startDate) {
      await this.validateDateRange(pause.startDate, pause.endDate);
    }

    const updatedPause = Object.assign(
      existingPause || new ApplicationPaused(),
      pause,
    );

    return await this.appPausedRepository.save(updatedPause);
  }

  private validateDateRange(startDate: Date, endDate?: Date | null) {
    if (endDate && startDate > endDate) {
      throw new ServiceValidationException(
        'Start Date must be smaller(earlier) than End Date',
      );
    }
  }
}
