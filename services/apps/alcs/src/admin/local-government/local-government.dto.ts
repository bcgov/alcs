import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class LocalGovernmentUpdateDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  bceidBusinessGuid: string | null;

  @IsBoolean()
  isFirstNation: boolean;

  @IsBoolean()
  isActive: boolean;

  @IsString()
  preferredRegionCode: string;
}

export class LocalGovernmentCreateDto extends LocalGovernmentUpdateDto {}
