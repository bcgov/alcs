import { AutoMap } from '@automapper/classes';
import { IsNumber, IsString } from 'class-validator';

export class CreateApplicationDecisionDto {
  @AutoMap()
  @IsNumber()
  date: number;

  @AutoMap()
  @IsString()
  applicationFileNumber;

  @AutoMap()
  @IsString()
  outcome: string;
}

export class UpdateApplicationDecisionDto {
  @AutoMap()
  @IsNumber()
  date: number;

  @AutoMap()
  @IsString()
  outcome: string;
}

export class ApplicationDecisionDto extends CreateApplicationDecisionDto {
  @AutoMap()
  @IsString()
  uuid: string;
}
