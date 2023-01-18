import { AutoMap } from '@automapper/classes';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';

export class ParcelLookupDto {
  legalDescription: string;
  mapArea: string;
  pin: string | undefined;
}

export class SearchParcelDto {
  @IsNumberString()
  pid: string;
}
