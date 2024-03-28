import { AutoMap } from 'automapper-classes';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class InquiryParcelDto {
  @AutoMap()
  uuid: string;

  @AutoMap()
  inquiryUuid: string;

  @AutoMap(() => String)
  pid?: string | null;

  @AutoMap(() => String)
  pin?: string | null;

  @AutoMap()
  civicAddress: string;
}

export class InquiryParcelCreateDto {
  @IsNotEmpty()
  @IsString()
  civicAddress: string;

  @IsOptional()
  @IsString()
  pid?: string | null;

  @IsOptional()
  @IsString()
  pin?: string | null;
}

export class InquiryParcelUpdateDto {
  @IsOptional()
  @IsString()
  uuid?: string;

  @IsString()
  @IsOptional()
  pid?: string | null;

  @IsString()
  @IsOptional()
  pin?: string | null;

  @IsString()
  @IsNotEmpty()
  civicAddress: string;
}
