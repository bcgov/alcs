import { AutoMap } from '@automapper/classes';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { BaseCodeDto } from '../../../common/dtos/base.dto';

export class NoticeOfIntentMeetingTypeDto extends BaseCodeDto {}

export class CreateNoticeOfIntentMeetingDto {
  @IsNumber()
  meetingStartDate: number;

  @IsNumber()
  @IsOptional()
  meetingEndDate?: number;

  @IsString()
  meetingTypeCode: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class CreateNoticeOfIntentMeetingServiceDto extends CreateNoticeOfIntentMeetingDto {
  @IsString()
  noticeOfIntentUuid: string;
}

export class NoticeOfIntentMeetingDto extends CreateNoticeOfIntentMeetingDto {
  @AutoMap()
  @IsString()
  uuid: string;

  @AutoMap()
  meetingType: NoticeOfIntentMeetingTypeDto;

  @AutoMap()
  meetingEndDate?: number;
}

export class UpdateNoticeOfIntentMeetingDto {
  @AutoMap()
  @IsOptional()
  @IsNumber()
  meetingStartDate?: number;

  @AutoMap()
  @IsNumber()
  @IsOptional()
  meetingEndDate?: number | null;

  @AutoMap()
  @IsString()
  @IsOptional()
  description?: string;
}
