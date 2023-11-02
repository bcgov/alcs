import { AutoMap } from 'automapper-classes';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { LocalGovernmentDto } from '../local-government/local-government.dto';
import { CardDto } from '../card/card.dto';
import { ApplicationRegionDto } from '../code/application-code/application-region/application-region.dto';

export class CreatePlanningReviewDto {
  @IsString()
  @IsNotEmpty()
  fileNumber: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  type: string;

  @IsString()
  @IsNotEmpty()
  localGovernmentUuid: string;

  @IsString()
  @IsNotEmpty()
  regionCode: string;

  @IsString()
  @IsNotEmpty()
  boardCode: string;
}

export class PlanningReviewDto {
  @AutoMap()
  fileNumber: string;

  @AutoMap()
  card: CardDto;

  @AutoMap()
  localGovernment: LocalGovernmentDto;

  @AutoMap()
  region: ApplicationRegionDto;

  @AutoMap()
  type: string;
}
