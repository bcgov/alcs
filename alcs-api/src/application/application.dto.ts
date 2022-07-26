import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { UserDto } from '../user/user.dto';

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
  assigneeUuid: string;

  assignee: UserDto;
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

  @IsString()
  assigneeUuid: string;
}
