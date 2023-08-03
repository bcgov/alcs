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
    private noiRepository: Repository<NoticeOfIntentMeeting>,
    @InjectRepository(NoticeOfIntentMeetingType)
    private noiMeetingTypeRepository: Repository<NoticeOfIntentMeetingType>,
    private noiService: NoticeOfIntentService,
  ) {}

  async getByAppFileNumber(number: string): Promise<NoticeOfIntentMeeting[]> {
    const noi = await this.noiService.getOrFailByUuid(number);
    return this.noiRepository.find({
      where: { noticeOfIntentUuid: noi.uuid },
      relations: DEFAULT_RELATIONS,
    });
  }

  get(uuid) {
    return this.noiRepository.findOne({
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

    await this.noiRepository.save(existingMeeting);

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

    const savedMeeting = await this.noiRepository.save(createMeeting);

    return this.get(savedMeeting.uuid);
  }

  async remove(meeting: NoticeOfIntentMeeting) {
    return this.noiRepository.softRemove(meeting);
  }

  async fetNoticeOfIntentMeetingTypes() {
    return await this.noiMeetingTypeRepository.find();
  }
}
