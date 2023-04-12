import { IsString } from 'class-validator';

export class ParcelLookupDto {
  legalDescription: string;
  mapArea: string;
  pin: string | undefined;
  pid: string | undefined;
}

export class SearchParcelDto {
  @IsString()
  pid: string;

  @IsString()
  type: string;
}
