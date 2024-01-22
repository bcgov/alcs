import { AutoMap } from 'automapper-classes';
import { IsArray, IsBoolean, IsString } from 'class-validator';

export enum BOARD_CODES {
  CEO = 'ceo',
  SOIL = 'soil',
  EXECUTIVE_COMMITTEE = 'exec',
}

export class MinimalBoardDto {
  @AutoMap()
  @IsString()
  code: string;

  @AutoMap()
  @IsString()
  title: string;

  @AutoMap()
  @IsBoolean()
  showOnSchedule: boolean;

  @IsArray()
  allowedCardTypes: string[];
}

export class BoardDto extends MinimalBoardDto {
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
  createCardTypes: string[];
}

export class BoardStatusDto {
  @AutoMap()
  order: number;

  label: string;
  statusCode: string;
}
