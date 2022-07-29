import { AutoMap } from '@automapper/classes';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { UserDto } from '../user/user.dto';
import { ApplicationStatusDto } from './application-status/application-status.dto';

export class ApplicationDto {
  @AutoMap()
  @IsNotEmpty()
  @IsString()
  fileNumber: string;

  @AutoMap()
  @IsNotEmpty()
  @IsString()
  title: string;

  @AutoMap()
  @IsNotEmpty()
  @IsString()
  body: string;

  @IsNotEmpty()
  @IsString()
  status: string;

  @AutoMap()
  @IsString()
  assigneeUuid?: string;

  @AutoMap()
  assignee?: UserDto;

  @AutoMap()
  activeDays: number;

  @AutoMap()
  pausedDays: number;

  @AutoMap()
  @IsBoolean()
  paused: boolean;
}

export class ApplicationDetailedDto extends ApplicationDto {
  @AutoMap()
  statusDetails: ApplicationStatusDto;
}

export class ApplicationPartialDto {
  @AutoMap()
  @IsNotEmpty()
  @IsString()
  fileNumber: string;

  @AutoMap()
  @IsOptional()
  title?: string;

  @AutoMap()
  @IsOptional()
  body?: string;

  @AutoMap()
  @IsOptional()
  status?: string;

  @AutoMap()
  @IsOptional()
  assigneeUuid?: string;

  @AutoMap()
  @IsBoolean()
  @IsOptional()
  paused?: boolean;
}
