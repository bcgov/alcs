import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ServiceNotFoundException,
  ServiceValidationException,
} from '../../common/exceptions/base.exception';
import { ApplicationPaused } from '../application-paused.entity';

@Injectable()
export class ApplicationPausedService {
  constructor(
    @InjectRepository(ApplicationPaused)
    private appPausedRepository,
  ) {}

  get(uuid) {
    return this.appPausedRepository.findOne({
      where: { uuid },
    });
  }

  remove(uuid: string) {
    const paused = this.get(uuid);
    return this.appPausedRepository.softRemove(paused);
  }

  async createOrUpdate(pause: Partial<ApplicationPaused>) {
    let existingPause;
    if (pause.uuid) {
      existingPause = await this.get(pause.uuid);
      if (!existingPause) {
        throw new ServiceNotFoundException(`Pause not found ${pause.uuid}`);
      }
    }

    await this.validateDateRange(pause.startDate, pause.endDate);

    const updatedPause = Object.assign(
      existingPause || new ApplicationPaused(),
      pause,
    );

    const savedPause = await this.appPausedRepository.save(updatedPause);

    return this.get(savedPause.uuid);
  }

  async update(uuid: string, startDate: Date, endDate: Date | null) {
    const existingPause = await this.get(uuid);
    if (!existingPause) {
      throw new ServiceNotFoundException(`Pause not found ${uuid}`);
    }

    await this.validateDateRange(startDate, endDate);

    const savedPause = await this.appPausedRepository.update(
      existingPause.uuid,
      {
        startDate: startDate,
        endDate: endDate,
      },
    );

    return this.get(savedPause.uuid);
  }

  private validateDateRange(startDate: Date, endDate: Date) {
    if (endDate && startDate > endDate) {
      throw new ServiceValidationException(
        'Start Date must be smaller(earlier) than End Date.',
      );
    }
  }
}
