import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceNotFoundException } from '../../common/exceptions/base.exception';
import { ApplicationService } from '../application.service';
import { ApplicationDecisionMeeting } from './application-decision-meeting.entity';

@Injectable()
export class ApplicationDecisionMeetingService {
  constructor(
    @InjectRepository(ApplicationDecisionMeeting)
    private appDecisionMeetingRepository: Repository<ApplicationDecisionMeeting>,
    private applicationService: ApplicationService,
  ) {}

  async getByAppFileNumber(number: string) {
    const application = await this.applicationService.getOrFail(number);

    return this.appDecisionMeetingRepository.find({
      where: { applicationUuid: application.uuid },
    });
  }

  get(uuid) {
    return this.appDecisionMeetingRepository.findOneOrFail({
      where: { uuid },
    });
  }

  async createOrUpdate(decisionMeeting: Partial<ApplicationDecisionMeeting>) {
    let existingMeeting;
    if (decisionMeeting.uuid) {
      existingMeeting = await this.appDecisionMeetingRepository.findOne({
        where: { uuid: decisionMeeting.uuid },
      });
      if (!existingMeeting) {
        throw new ServiceNotFoundException(
          `Decision meeting not found ${decisionMeeting.uuid}`,
        );
      }
    }

    const updatedMeeting = Object.assign(
      existingMeeting || new ApplicationDecisionMeeting(),
      decisionMeeting,
    );

    return this.appDecisionMeetingRepository.save(updatedMeeting);
  }

  async delete(uuid) {
    const meeting = await this.get(uuid);
    return this.appDecisionMeetingRepository.softRemove([meeting]);
  }

  async getUpcomingMeetings(): Promise<
    { uuid: string; next_meeting: string }[]
  > {
    return await this.appDecisionMeetingRepository
      .createQueryBuilder('meeting')
      .select('application.uuid, MAX(meeting.date) as next_meeting')
      .leftJoin('meeting.application', 'application')
      .groupBy('application.uuid')
      .getRawMany();
  }
}
