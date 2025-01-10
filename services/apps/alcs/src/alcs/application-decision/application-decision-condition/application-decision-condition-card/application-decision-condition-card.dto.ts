import { AutoMap } from 'automapper-classes';
import { ApplicationDecisionConditionDto } from '../application-decision-condition.dto';
import { IsArray, IsString, IsUUID } from 'class-validator';
import { condition } from 'automapper-core';
import { CardDto } from '../../../card/card.dto';

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
  conditionsUuids: string[];
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

  @AutoMap(() => ApplicationDecisionConditionDto)
  @IsArray()
  conditions: ApplicationDecisionConditionDto[];

  @AutoMap()
  card: CardDto;

  @IsString()
  decisionUuid: string;
}
