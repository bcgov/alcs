import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { filterUndefined } from '../../../utils/undefined';
import { PlanningReviewService } from '../planning-review.service';
import { PlanningReviewMeetingType } from './planning-review-meeting-type.entity';
import {
  CreatePlanningReviewMeetingDto,
  UpdatePlanningReviewMeetingDto,
} from './planning-review-meeting.dto';
import { PlanningReviewMeeting } from './planning-review-meeting.entity';

@Injectable()
export class PlanningReviewMeetingService {
  constructor(
    private planningReviewService: PlanningReviewService,
    @InjectRepository(PlanningReviewMeeting)
    private meetingRepository: Repository<PlanningReviewMeeting>,
    @InjectRepository(PlanningReviewMeetingType)
    private meetingTypeRepository: Repository<PlanningReviewMeetingType>,
  ) {}

  async listTypes() {
    return this.meetingTypeRepository.find();
  }

  getByPlanningReview(uuid: string) {
    return this.meetingRepository.find({
      where: {
        planningReviewUuid: uuid,
      },
      relations: {
        type: true,
      },
    });
  }

  getByUuid(uuid: string) {
    return this.meetingRepository.findOne({
      where: {
        uuid,
      },
      relations: {
        type: true,
      },
    });
  }

  async create(createDto: CreatePlanningReviewMeetingDto) {
    const parentPlanningReview = await this.planningReviewService.getOrFail(
      createDto.planningReviewUuid,
    );

    const type = await this.meetingTypeRepository.findOneOrFail({
      where: {
        code: createDto.typeCode,
      },
    });

    const newMeeting = new PlanningReviewMeeting({
      planningReview: parentPlanningReview,
      date: new Date(createDto.date),
      type,
    });

    return await this.meetingRepository.save(newMeeting);
  }

  async remove(uuid: string) {
    const meeting = await this.meetingRepository.findOneOrFail({
      where: {
        uuid,
      },
    });

    await this.meetingRepository.remove(meeting);
  }

  async update(uuid: string, updateDto: UpdatePlanningReviewMeetingDto) {
    const existingMeeting = await this.meetingRepository.findOneOrFail({
      where: {
        uuid,
      },
    });

    existingMeeting.type = await this.meetingTypeRepository.findOneOrFail({
      where: {
        code: updateDto.typeCode,
      },
    });
    existingMeeting.date = filterUndefined(
      new Date(updateDto.date),
      existingMeeting.date,
    );

    await this.meetingRepository.save(existingMeeting);
  }
}
