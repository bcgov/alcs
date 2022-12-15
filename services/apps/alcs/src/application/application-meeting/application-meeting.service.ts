import {
  ServiceNotFoundException,
  ServiceValidationException,
} from '@app/common/exceptions/base.exception';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsRelations, Repository } from 'typeorm';
import { formatIncomingDate } from '../../utils/incoming-date.formatter';
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
    const application = await this.applicationService.getOrFail(number);
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

  async update(uuid: string, updateDto: UpdateApplicationMeetingDto) {
    const existingMeeting: Partial<ApplicationMeeting> | null = await this.get(
      uuid,
    );
    if (!existingMeeting) {
      throw new ServiceNotFoundException(`Meeting not found ${uuid}`);
    }

    if (!existingMeeting.meetingPause) {
      throw new ServiceValidationException(
        `Cannot update deleted meeting ${uuid}`,
      );
    }

    if (
      updateDto.meetingEndDate &&
      updateDto.meetingStartDate &&
      updateDto.meetingStartDate > updateDto.meetingEndDate
    ) {
      throw new ServiceValidationException(
        'Start Date must be smaller than End Date',
      );
    }

    if (updateDto.meetingStartDate) {
      existingMeeting.meetingPause.startDate = new Date(
        updateDto.meetingStartDate,
      );
    }
    existingMeeting.meetingPause.endDate = formatIncomingDate(
      updateDto.meetingEndDate,
    );

    if (updateDto.description) {
      existingMeeting.description = updateDto.description;
    }

    if (
      updateDto.reportStartDate !== undefined ||
      updateDto.reportEndDate !== undefined
    ) {
      if (existingMeeting.reportPause) {
        if (updateDto.reportStartDate) {
          existingMeeting.reportPause.startDate = new Date(
            updateDto.reportStartDate,
          );
        }
        existingMeeting.reportPause.endDate = formatIncomingDate(
          updateDto.reportEndDate,
        );
      } else {
        if (!updateDto.reportStartDate) {
          throw new ServiceValidationException(
            'Cannot set reportEndDate without reportStartDate',
          );
        }

        existingMeeting.reportPause = new ApplicationPaused({
          applicationUuid: existingMeeting.applicationUuid,
          startDate: new Date(updateDto.reportStartDate),
          endDate: formatIncomingDate(updateDto.reportEndDate),
        });
      }
    }

    if (
      updateDto.reportStartDate === null &&
      updateDto.reportEndDate === null
    ) {
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
