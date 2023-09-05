import { AutoMap } from '@automapper/classes';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { CardDto } from '../card/card.dto';
import { ApplicationRegionDto } from '../code/application-code/application-region/application-region.dto';
import { LocalGovernmentDto } from '../local-government/local-government.dto';
import { NotificationTypeDto } from './notification-type/notification-type.dto';

export class NotificationDto {
  @AutoMap()
  uuid: string;

  @AutoMap()
  fileNumber: string;

  @AutoMap()
  applicant: string;

  @AutoMap()
  card: CardDto;

  dateSubmittedToAlc?: number;

  @AutoMap()
  localGovernment: LocalGovernmentDto;

  @AutoMap()
  region: ApplicationRegionDto;

  @AutoMap(() => String)
  summary?: string;

  @AutoMap(() => NotificationTypeDto)
  type: NotificationTypeDto;

  @AutoMap(() => String)
  staffObservations?: string;

  proposalEndDate?: number;
}

export class UpdateNotificationDto {
  @IsOptional()
  @IsNumber()
  dateSubmittedToAlc?: number;

  @IsOptional()
  @IsUUID()
  localGovernmentUuid?: string;

  @IsString()
  @IsOptional()
  summary?: string;

  @IsOptional()
  @IsString()
  staffObservations?: string;

  @IsOptional()
  @IsNumber()
  proposalEndDate?: number;
}

export class CreateNotificationServiceDto {
  fileNumber: string;
  applicant: string;
  typeCode: string;
  dateSubmittedToAlc?: Date | null | undefined;
  regionCode?: string;
  localGovernmentUuid?: string;
}
