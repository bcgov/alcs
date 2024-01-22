import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsRelations, Repository } from 'typeorm';
import {
  ServiceNotFoundException,
  ServiceValidationException,
} from '../../../../../../libs/common/src/exceptions/base.exception';
import { formatIncomingDate } from '../../../utils/incoming-date.formatter';
import { NoticeOfIntentService } from '../notice-of-intent.service';
import { NoticeOfIntentMeetingType } from './notice-of-intent-meeting-type.entity';
import {
  CreateNoticeOfIntentMeetingServiceDto,
  UpdateNoticeOfIntentMeetingDto,
} from './notice-of-intent-meeting.dto';
import { NoticeOfIntentMeeting } from './notice-of-intent-meeting.entity';

const DEFAULT_RELATIONS: FindOptionsRelations<NoticeOfIntentMeeting> = {
  type: true,
};

@Injectable()
export class NoticeOfIntentMeetingService {
  constructor(
    @InjectRepository(NoticeOfIntentMeeting)
    private noticeOfIntentMeetingRepository: Repository<NoticeOfIntentMeeting>,
    @InjectRepository(NoticeOfIntentMeetingType)
    private noiMeetingTypeRepository: Repository<NoticeOfIntentMeetingType>,
    private noticeOfIntentService: NoticeOfIntentService,
  ) {}

  async getByFileNumber(number: string): Promise<NoticeOfIntentMeeting[]> {
    const uuid = await this.noticeOfIntentService.getUuid(number);
    return await this.noticeOfIntentMeetingRepository.find({
      where: { noticeOfIntentUuid: uuid },
      relations: DEFAULT_RELATIONS,
    });
  }

  get(uuid) {
    return this.noticeOfIntentMeetingRepository.findOne({
      where: { uuid },
      relations: DEFAULT_RELATIONS,
    });
  }

  async update(uuid: string, updateDto: UpdateNoticeOfIntentMeetingDto) {
    const existingMeeting: Partial<NoticeOfIntentMeeting> | null =
      await this.get(uuid);
    if (!existingMeeting) {
      throw new ServiceNotFoundException(`Meeting not found ${uuid}`);
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

    existingMeeting.description = updateDto.description
      ? updateDto.description
      : existingMeeting.description;
    existingMeeting.startDate = updateDto.meetingStartDate
      ? (formatIncomingDate(updateDto.meetingStartDate) as Date | undefined)
      : existingMeeting.startDate;
    existingMeeting.endDate = formatIncomingDate(updateDto.meetingEndDate);

    await this.noticeOfIntentMeetingRepository.save(existingMeeting);

    return this.get(uuid);
  }

  async create(meeting: CreateNoticeOfIntentMeetingServiceDto) {
    const createMeeting = new NoticeOfIntentMeeting();
    createMeeting.startDate = meeting.meetingStartDate
      ? (formatIncomingDate(meeting.meetingStartDate) as Date)
      : createMeeting.startDate;
    createMeeting.endDate = formatIncomingDate(meeting.meetingEndDate);
    createMeeting.description = meeting.description;
    createMeeting.typeCode = meeting.meetingTypeCode;
    createMeeting.noticeOfIntentUuid = meeting.noticeOfIntentUuid;

    const savedMeeting = await this.noticeOfIntentMeetingRepository.save(
      createMeeting,
    );

    return this.get(savedMeeting.uuid);
  }

  async remove(meeting: NoticeOfIntentMeeting) {
    return this.noticeOfIntentMeetingRepository.softRemove(meeting);
  }

  async fetNoticeOfIntentMeetingTypes() {
    return await this.noiMeetingTypeRepository.find();
  }
}
