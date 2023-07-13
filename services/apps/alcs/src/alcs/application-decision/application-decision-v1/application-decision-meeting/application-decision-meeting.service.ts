import { ServiceNotFoundException } from '@app/common/exceptions/base.exception';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicationSubmissionStatusService } from '../../../../portal/application-submission/submission-status/application-submission-status.service';
import { SUBMISSION_STATUS } from '../../../../portal/application-submission/submission-status/submission-status.dto';
import { ApplicationService } from '../../../application/application.service';
import { CARD_STATUS } from '../../../card/card-status/card-status.entity';
import { ApplicationDecisionMeeting } from './application-decision-meeting.entity';

@Injectable()
export class ApplicationDecisionMeetingService {
  private logger = new Logger(ApplicationDecisionMeetingService.name);

  constructor(
    @InjectRepository(ApplicationDecisionMeeting)
    private appDecisionMeetingRepository: Repository<ApplicationDecisionMeeting>,
    private applicationService: ApplicationService,
    private applicationSubmissionStatusService: ApplicationSubmissionStatusService,
  ) {}

  async getByAppFileNumber(number: string) {
    const application = await this.applicationService.getOrFail(number);

    return this.appDecisionMeetingRepository.find({
      where: { applicationUuid: application.uuid },
    });
  }

  get(uuid: string) {
    return this.appDecisionMeetingRepository.findOne({
      where: { uuid },
    });
  }

  async getOrFail(uuid: string) {
    const meeting = await this.appDecisionMeetingRepository.findOne({
      where: { uuid },
    });
    if (meeting) {
      return meeting;
    }
    throw new ServiceNotFoundException(`Decision meeting not found ${uuid}`);
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

    const meeting = await this.appDecisionMeetingRepository.save(
      updatedMeeting,
    );

    await this.updateSubmissionStatus(meeting);

    return meeting;
  }

  private async updateSubmissionStatus(meeting: ApplicationDecisionMeeting) {
    const application = await this.applicationService.getByUuidOrFail(
      meeting.applicationUuid,
    );

    const currentStatuses =
      await this.applicationSubmissionStatusService.getCurrentStatusesByFileNumber(
        application.fileNumber,
      );

    if (!currentStatuses || (currentStatuses && currentStatuses.length < 1)) {
      return;
    }

    const inReviewByALC = currentStatuses.find(
      (s) => s.statusTypeCode === SUBMISSION_STATUS.IN_REVIEW_BY_ALC,
    );

    const meetings = await this.getByAppFileNumber(application.fileNumber);

    if (meetings?.length < 1) {
      this.applicationSubmissionStatusService.setStatusDate(
        currentStatuses[0].submissionUuid,
        SUBMISSION_STATUS.IN_REVIEW_BY_ALC,
        null,
      );

      return;
    }

    const earliestMeeting = meetings.reduce((min, current) =>
      current.date < min.date ? current : min,
    );

    if (
      inReviewByALC &&
      inReviewByALC.effectiveDate &&
      inReviewByALC.effectiveDate !== earliestMeeting.date
    ) {
      this.applicationSubmissionStatusService.setStatusDate(
        inReviewByALC.submissionUuid,
        SUBMISSION_STATUS.IN_REVIEW_BY_ALC,
        earliestMeeting.date,
      );
    }
  }

  async delete(uuid) {
    const meeting = await this.getOrFail(uuid);
    const deleted = this.appDecisionMeetingRepository.softRemove([meeting]);
    this.updateSubmissionStatus(meeting);
    return deleted;
  }

  async getUpcomingReconsiderationMeetings(): Promise<
    { uuid: string; next_meeting: string }[]
  > {
    return await this.appDecisionMeetingRepository
      .createQueryBuilder('meeting')
      .select('reconsideration.uuid, MAX(meeting.date) as next_meeting')
      .innerJoin('meeting.application', 'application')
      .innerJoin('application.reconsiderations', 'reconsideration')
      .innerJoin('reconsideration.card', 'card')
      .where(`card.status_code != '${CARD_STATUS.DECISION_RELEASED}'`)
      .groupBy('reconsideration.uuid')
      .getRawMany();
  }

  async getUpcomingApplicationMeetings(): Promise<
    { uuid: string; next_meeting: string }[]
  > {
    return await this.appDecisionMeetingRepository
      .createQueryBuilder('meeting')
      .select('application.uuid, MAX(meeting.date) as next_meeting')
      .innerJoin('meeting.application', 'application')
      .innerJoin('application.card', 'card')
      .where(`card.status_code != '${CARD_STATUS.DECISION_RELEASED}'`)
      .groupBy('application.uuid')
      .getRawMany();
  }
}
