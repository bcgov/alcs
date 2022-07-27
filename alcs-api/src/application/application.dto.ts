import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { UserDto } from '../user/user.dto';
import { ApplicationStatusDto } from './application-status/application-status.dto';

export class ApplicationDto {
  @IsNotEmpty()
  @IsString()
  fileNumber: string;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  body: string;

  @IsNotEmpty()
  @IsString()
  status: string;

  @IsString()
  assigneeUuid?: string;

  assignee?: UserDto;
}

export class ApplicationDetailedDto extends ApplicationDto {
  statusDetails: ApplicationStatusDto;
}

export class ApplicationPartialDto {
  @IsNotEmpty()
  @IsString()
  fileNumber: string;

  @IsOptional()
  title?: string;

  @IsOptional()
  body?: string;

  @IsOptional()
  status?: string;

  @IsOptional()
  assigneeUuid?: string;
}
