import { IsBoolean, IsString } from 'class-validator';

export class LocalGovernmentUpdateDto {
  @IsString()
  name: string;

  @IsString()
  bceidBusinessGuid: string | null;

  @IsBoolean()
  isFirstNation: boolean;

  @IsBoolean()
  isActive: boolean;
}

export class LocalGovernmentCreateDto extends LocalGovernmentUpdateDto {}
