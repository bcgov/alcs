import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsRelations, Repository } from 'typeorm';
import {
  ServiceNotFoundException,
  ServiceValidationException,
} from '../../common/exceptions/base.exception';
import { ApplicationPaused } from '../application-paused.entity';
import { ApplicationService } from '../application.service';
import { UpdateApplicationMeetingDto } from './application-meeting.dto';
import { ApplicationMeeting } from './application-meeting.entity';

const DEFAULT_RELATIONS: FindOptionsRelations<ApplicationMeeting> = {
  type: true,
  meetingPause: true,
  reportPause: true,
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

  async update(uuid: string, meeting: UpdateApplicationMeetingDto) {
    const existingMeeting = await this.get(uuid);
    if (!existingMeeting) {
      throw new ServiceNotFoundException(`Meeting not found ${uuid}`);
    }

    if (
      meeting.meetingEndDate &&
      meeting.meetingStartDate > meeting.meetingEndDate
    ) {
      throw new ServiceValidationException(
        'Start Date must be smaller than End Date',
      );
    }

    if (meeting.meetingStartDate) {
      existingMeeting.meetingPause.startDate = new Date(
        meeting.meetingStartDate,
      );
    }

    if (meeting.description) {
      existingMeeting.description = meeting.description;
    }

    if (meeting.meetingEndDate !== undefined) {
      existingMeeting.meetingPause.endDate = meeting.meetingEndDate
        ? new Date(meeting.meetingEndDate)
        : null;
    }

    if (
      meeting.reportStartDate !== undefined ||
      meeting.reportEndDate !== undefined
    ) {
      if (existingMeeting.reportPause) {
        if (meeting.reportStartDate) {
          existingMeeting.reportPause.startDate = meeting.reportStartDate
            ? new Date(meeting.reportStartDate)
            : null;
        }

        if (meeting.reportEndDate) {
          existingMeeting.reportPause.endDate = meeting.reportEndDate
            ? new Date(meeting.reportEndDate)
            : null;
        }
      } else {
        existingMeeting.reportPause = new ApplicationPaused({
          applicationUuid: existingMeeting.applicationUuid,
          startDate: meeting.reportStartDate
            ? new Date(meeting.reportStartDate)
            : undefined,
          endDate: meeting.reportEndDate
            ? new Date(meeting.reportEndDate)
            : undefined,
        });
      }
    }

    if (meeting.reportStartDate === null && meeting.reportEndDate === null) {
      existingMeeting.reportPause = null;
    }

    await this.appMeetingRepository.save(existingMeeting);

    return this.get(uuid);
  }

  async create(meeting: Partial<ApplicationMeeting>) {
    const createMeeting = new ApplicationMeeting(meeting);
    const savedMeeting = await this.appMeetingRepository.save(createMeeting);

    return this.get(savedMeeting.uuid);
  }

  async remove(meeting: ApplicationMeeting) {
    return this.appMeetingRepository.softRemove(meeting);
  }
}
