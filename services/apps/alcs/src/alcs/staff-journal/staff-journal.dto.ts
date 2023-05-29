import { AutoMap } from '@automapper/classes';
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

export class CreateApplicationStaffJournalDto {
  @IsString()
  @IsNotEmpty()
  applicationUuid: string;

  @IsString()
  @IsNotEmpty()
  body: string;
}

export class CreateNoticeOfIntentStaffJournalDto {
  @IsString()
  @IsNotEmpty()
  noticeOfIntentUuid: string;

  @IsString()
  @IsNotEmpty()
  body: string;
}

export class UpdateStaffJournalDto {
  @IsString()
  @IsNotEmpty()
  uuid: string;

  @IsString()
  @IsNotEmpty()
  body: string;
}
