import { AutoMap } from '@automapper/classes';
import { IsArray, IsString } from 'class-validator';

export enum BOARD_CODES {
  CEO = 'ceo',
  SOIL = 'soil',
  EXECUTIVE_COMMITTEE = 'exec',
}

export class BoardDto {
  @AutoMap()
  @IsString()
  code: string;

  @AutoMap()
  @IsString()
  title: string;

  @AutoMap()
  @IsArray()
  statuses: BoardStatusDto[];

  @IsArray()
  allowedCardTypes: string[];

  @IsArray()
  createCardTypes: string[];
}

export class BoardSmallDto {
  @AutoMap()
  code: string;

  @AutoMap()
  title: string;

  @AutoMap()
  decisionMaker: string;
}

export class BoardStatusDto {
  @AutoMap()
  order: number;

  label: string;
  statusCode: string;
}
