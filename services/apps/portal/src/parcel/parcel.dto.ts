import { IsNumberString } from 'class-validator';

export class ParcelLookupDto {
  legalDescription: string;
  mapArea: string;
  pin: string | undefined;
}

export class SearchParcelDto {
  @IsNumberString()
  pid: string;
}
