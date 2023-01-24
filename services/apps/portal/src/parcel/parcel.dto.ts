import { IsString } from 'class-validator';

export class ParcelLookupDto {
  legalDescription: string;
  mapArea: string;
  pin: string | undefined;
}

export class SearchParcelDto {
  @IsString()
  pid: string;
}
