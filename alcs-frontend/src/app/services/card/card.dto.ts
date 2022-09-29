import { BaseCodeDto } from '../../shared/dto/base.dto';
import { ApplicationRegionDto, ApplicationStatusDto } from '../application/application-code.dto';
import { UserDto } from '../user/user.dto';

export interface ReconsiderationTypeDto extends BaseCodeDto {
  backgroundColor: string;
  textColor: string;
}

export interface CardTypeDto extends BaseCodeDto {}

export interface ReconsiderationDto {
  highPriority: boolean;
  status: string;
  uuid: string; // this is a cardUuid for now
  board: string;
  assignee?: UserDto;
  // TODO: provide actual properties once we have reconsideration
  applicationFileNumber: string;
  statusDetails: ApplicationStatusDto;
  regionDetails: ApplicationRegionDto;
  typeDetails: ReconsiderationTypeDto;
  card: CardDto;
}

export interface CardCreateDto {
  boardCode: string;
  typeCode: string;
}

export interface CardDto {
  uuid: string;
  type: string;
}
