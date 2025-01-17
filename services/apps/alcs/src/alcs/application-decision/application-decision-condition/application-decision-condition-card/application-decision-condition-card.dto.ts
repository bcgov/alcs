import { AutoMap } from 'automapper-classes';
import { ApplicationDecisionConditionDto } from '../application-decision-condition.dto';
import { IsArray, IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';
import { CardDto } from '../../../card/card.dto';
import { ApplicationTypeDto } from '../../../code/application-code/application-type/application-type.dto';

export class ApplicationDecisionConditionCardDto {
  @AutoMap()
  @IsUUID()
  uuid: string;

  @AutoMap(() => ApplicationDecisionConditionDto)
  @IsArray()
  conditions: ApplicationDecisionConditionDto[];

  @AutoMap()
  @IsString()
  cardUuid: string;

  @IsString()
  decisionUuid: string;

  @IsString()
  @IsOptional()
  applicationFileNumber?: string | null;
}

export class CreateApplicationDecisionConditionCardDto {
  @AutoMap()
  @IsArray()
  conditionsUuids: string[];

  @AutoMap()
  @IsString()
  decisionUuid: string;

  @AutoMap()
  @IsString()
  cardStatusCode: string;
}

export class UpdateApplicationDecisionConditionCardDto {
  @AutoMap()
  @IsArray()
  @IsOptional()
  conditionsUuids?: string[] | null;

  @AutoMap()
  @IsString()
  @IsOptional()
  cardStatusCode?: string | null;
}

export class ApplicationDecisionConditionCardUuidDto {
  @AutoMap()
  @IsUUID()
  uuid: string;
}

export class ApplicationDecisionConditionCardBoardDto {
  @AutoMap()
  @IsUUID()
  uuid: string;

  @IsArray()
  conditions: ApplicationDecisionConditionDto[];

  @AutoMap()
  card: CardDto;

  @IsString()
  decisionUuid: string;

  @IsString()
  fileNumber: string;

  @IsString()
  @IsOptional()
  applicant?: string | null;

  @IsOptional()
  type?: ApplicationTypeDto | null;

  @IsBoolean()
  isReconsideration?: boolean;

  @IsBoolean()
  isModification?: boolean;
}

export class UpdateApplicationDecisionConditionBoardCardDto {
  @AutoMap()
  @IsString()
  cardStatusCode: string;
}
