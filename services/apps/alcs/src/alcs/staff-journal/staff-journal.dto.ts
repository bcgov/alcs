import { AutoMap } from 'automapper-classes';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class StaffJournalDto {
  @AutoMap()
  uuid: string;

  @AutoMap()
  body: string;

  @AutoMap()
  author: string;

  @AutoMap()
  edited: boolean;

  @AutoMap()
  createdAt: number;

  isEditable = false;
}

class BaseCreateStaffJournalDto {
  @IsString()
  @IsNotEmpty()
  body: string;
}

export class CreateApplicationStaffJournalDto extends BaseCreateStaffJournalDto {
  @IsUUID()
  @IsNotEmpty()
  applicationUuid: string;
}

export class CreateNoticeOfIntentStaffJournalDto extends BaseCreateStaffJournalDto {
  @IsUUID()
  @IsNotEmpty()
  noticeOfIntentUuid: string;
}

export class CreateNotificationStaffJournalDto extends BaseCreateStaffJournalDto {
  @IsUUID()
  @IsNotEmpty()
  notificationUuid: string;
}

export class CreatePlanningReviewStaffJournalDto extends BaseCreateStaffJournalDto {
  @IsUUID()
  @IsNotEmpty()
  planningReviewUuid: string;
}

export class CreateInquiryStaffJournalDto extends BaseCreateStaffJournalDto {
  @IsUUID()
  @IsNotEmpty()
  inquiryUuid: string;
}

export class UpdateStaffJournalDto extends BaseCreateStaffJournalDto {
  @IsString()
  @IsNotEmpty()
  uuid: string;
}
