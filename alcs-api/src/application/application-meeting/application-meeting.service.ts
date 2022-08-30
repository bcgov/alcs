import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsRelations, Repository } from 'typeorm';
import {
  ServiceNotFoundException,
  ServiceValidationException,
} from '../../common/exceptions/base.exception';
import { ApplicationService } from '../application.service';
import { ApplicationMeeting } from './application-meeting.entity';

const DEFAULT_RELATIONS: FindOptionsRelations<ApplicationMeeting> = {
  type: true,
  applicationPaused: true,
};

@Injectable()
export class ApplicationMeetingService {
  constructor(
    @InjectRepository(ApplicationMeeting)
    private appMeetingRepository: Repository<ApplicationMeeting>,
    private applicationService: ApplicationService,
  ) {}

  async getByAppFileNumber(number: string): Promise<ApplicationMeeting[]> {
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

  async update(meeting: Partial<ApplicationMeeting>) {
    let existingMeeting: ApplicationMeeting | undefined;
    if (meeting.uuid) {
      existingMeeting = await this.get(meeting.uuid);
      if (!existingMeeting) {
        throw new ServiceNotFoundException(`Meeting not found ${meeting.uuid}`);
      }
    }

    meeting.applicationPaused = Object.assign(
      existingMeeting.applicationPaused,
      meeting.applicationPaused,
    );
    meeting = Object.assign(existingMeeting, meeting);
    await this.appMeetingRepository.save(existingMeeting);

    return this.get(meeting.uuid);
  }

  async create(meeting: Partial<ApplicationMeeting>) {
    // TODO: this will be removed in ALCS-96
    this.validateDateRange(meeting.startDate, meeting.endDate);

    const createMeeting = Object.assign(new ApplicationMeeting(), meeting);

    const savedMeeting = await this.appMeetingRepository.save(createMeeting);

    return this.get(savedMeeting.uuid);
  }

  async remove(uuid) {
    const meeting = await this.appMeetingRepository.findOne({
      where: { uuid },
      relations: {
        applicationPaused: true,
      } as FindOptionsRelations<ApplicationMeeting>,
    });
    return this.appMeetingRepository.softRemove([meeting]);
  }

  private validateDateRange(startDate: Date, endDate: Date) {
    if (endDate && startDate > endDate) {
      throw new ServiceValidationException(
        'Start Date must be smaller than End Date.',
      );
    }
  }
}
