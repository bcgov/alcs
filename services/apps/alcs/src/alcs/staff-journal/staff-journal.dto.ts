import { AutoMap } from 'automapper-classes';
import { IsNotEmpty, IsString } from 'class-validator';

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
  @IsString()
  @IsNotEmpty()
  applicationUuid: string;
}

export class CreateNoticeOfIntentStaffJournalDto extends BaseCreateStaffJournalDto {
  @IsString()
  @IsNotEmpty()
  noticeOfIntentUuid: string;

  @IsString()
  @IsNotEmpty()
  body: string;
}

export class CreateNotificationStaffJournalDto extends BaseCreateStaffJournalDto {
  @IsString()
  @IsNotEmpty()
  notificationUuid: string;
}

export class CreatePlanningReviewStaffJournalDto extends BaseCreateStaffJournalDto {
  @IsString()
  @IsNotEmpty()
  planningReviewUuid: string;
}

export class UpdateStaffJournalDto {
  @IsString()
  @IsNotEmpty()
  uuid: string;

  @IsString()
  @IsNotEmpty()
  body: string;
}
