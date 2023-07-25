import { AutoMap } from '@automapper/classes';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { AssigneeDto } from '../../user/user.dto';
import { MinimalBoardDto } from '../board/board.dto';
import { CardStatusDto, CardTypeDto } from './card-status/card-status.dto';
import { CARD_TYPE } from './card-type/card-type.entity';

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
  statusCode?: string;

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
  typeCode: CARD_TYPE;
}

export class CardDto {
  @AutoMap()
  assignee?: AssigneeDto;

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
  boardCode: string;

  @AutoMap()
  createdAt: number;
}

export class CardDetailedDto extends CardDto {
  @AutoMap()
  statusDetails: CardStatusDto;

  @AutoMap()
  typeDetails: CardTypeDto;
}
