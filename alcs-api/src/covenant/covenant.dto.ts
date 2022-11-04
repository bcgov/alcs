import { AutoMap } from '@automapper/classes';
import { IsNotEmpty, IsString } from 'class-validator';
import { ApplicationLocalGovernmentDto } from '../application/application-code/application-local-government/application-local-government.dto';
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
}

export class CovenantDto {
  @AutoMap()
  fileNumber: string;

  @AutoMap()
  applicant: string;

  @AutoMap()
  card: CardDto;

  @AutoMap()
  localGovernment: ApplicationLocalGovernmentDto;

  @AutoMap()
  region: ApplicationRegionDto;
}
