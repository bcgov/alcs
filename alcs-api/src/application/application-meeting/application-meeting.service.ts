import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsRelations } from 'typeorm';
import {
  ServiceNotFoundException,
  ServiceValidationException,
} from '../../common/exceptions/base.exception';
import { ApplicationService } from '../application.service';
import { ApplicationMeeting } from './application-meeting.entity';

const DEFAULT_RELATIONS: FindOptionsRelations<ApplicationMeeting> = {
  type: true,
};

@Injectable()
export class ApplicationMeetingService {
  constructor(
    @InjectRepository(ApplicationMeeting)
    private appMeetingRepository,
    private applicationService: ApplicationService,
  ) {}

  async getByAppFileNumber(number: string) {
    const application = await this.applicationService.get(number);

    if (!application) {
      throw new ServiceNotFoundException(
        `Application with provided number not found ${number}`,
      );
    }

    return this.appMeetingRepository.find({
      where: { applicationUuid: application.uuid },
      relations: DEFAULT_RELATIONS,
    });
  }

  get(uuid) {
    return this.appMeetingRepository.findOne({
      where: { uuid },
      relations: DEFAULT_RELATIONS,
    });
  }

  async createOrUpdate(meeting: Partial<ApplicationMeeting>) {
    let existingMeeting;
    if (meeting.uuid) {
      existingMeeting = await this.get(meeting.uuid);
      if (!existingMeeting) {
        throw new ServiceNotFoundException(
          `Decision meeting not found ${meeting.uuid}`,
        );
      }
    }

    this.validateDateRange(meeting.startDate, meeting.endDate);

    const updatedMeeting = Object.assign(
      existingMeeting || new ApplicationMeeting(),
      meeting,
    );

    const savedMeeting = await this.appMeetingRepository.save(updatedMeeting);

    return this.get(savedMeeting.uuid);
  }

  async delete(uuid) {
    const meeting = await this.get(uuid);
    return this.appMeetingRepository.softRemove([meeting]);
  }

  private validateDateRange(startDate: Date, endDate: Date) {
    if (startDate > endDate) {
      throw new ServiceValidationException(
        'Start Date must be smaller that End Date.',
      );
    }
  }
}
