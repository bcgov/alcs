import { AutoMap } from 'automapper-classes';
import { IsNotEmpty, IsString } from 'class-validator';
import { LocalGovernmentDto } from '../local-government/local-government.dto';
import { CardDto } from '../card/card.dto';
import { ApplicationRegionDto } from '../code/application-code/application-region/application-region.dto';

export class CreateCovenantDto {
  @IsString()
  @IsNotEmpty()
  fileNumber: string;

  @IsString()
  @IsNotEmpty()
  applicant: string;

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

export class CovenantDto {
  @AutoMap()
  fileNumber: string;

  @AutoMap()
  applicant: string;

  @AutoMap()
  card: CardDto;

  @AutoMap()
  localGovernment: LocalGovernmentDto;

  @AutoMap()
  region: ApplicationRegionDto;
}
