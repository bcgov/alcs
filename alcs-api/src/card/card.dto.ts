import { AutoMap } from '@automapper/classes';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { BoardSmallDto } from '../board/board.dto';
import { UserDto } from '../user/user.dto';
import { CardStatusDto, CardTypeDto } from './card-status/card-status.dto';

export class CardUpdateDto {
  @AutoMap()
  @IsString()
  @IsOptional()
  assigneeUuid?: string;

  @AutoMap()
  @IsOptional()
  statusCode?: string;

  @AutoMap()
  @IsOptional()
  boardCode?: string;

  @AutoMap()
  cardTypeCode?: string;

  @AutoMap()
  @IsBoolean()
  @IsOptional()
  highPriority?: boolean;
}

export class CardUpdateServiceDto {
  @AutoMap()
  @IsString()
  @IsOptional()
  assigneeUuid?: string;

  @AutoMap()
  @IsOptional()
  statusUuid?: string;

  @AutoMap()
  @IsOptional()
  boardUuid?: string;

  @AutoMap()
  cardTypeCode?: string;

  @AutoMap()
  @IsBoolean()
  @IsOptional()
  highPriority?: boolean;
}

export class CardCreateDto {
  @IsNotEmpty()
  @IsString()
  boardCode: string;

  @IsNotEmpty()
  @IsString()
  typeCode: string;
}

export class CardDto {
  @AutoMap()
  assignee?: UserDto;

  @AutoMap()
  status: CardStatusDto;

  @AutoMap()
  type: string;

  @AutoMap()
  uuid: string;

  @AutoMap()
  @IsBoolean()
  @IsOptional()
  highPriority?: boolean;

  @AutoMap()
  board: BoardSmallDto;
}

export class CardDetailedDto extends CardDto {
  @AutoMap()
  statusDetails: CardStatusDto;

  @AutoMap()
  typeDetails: CardTypeDto;
}
