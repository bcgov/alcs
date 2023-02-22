import { ApplicationLocalGovernmentDto } from '../application/application-local-government/application-local-government.dto';

export interface LocalGovernmentUpdateDto {
  name: string;
  bceidBusinessGuid: string | null;
  isFirstNation: boolean;
  isActive: boolean;
}

export interface LocalGovernmentCreateDto extends LocalGovernmentUpdateDto {}

export interface LocalGovernmentDto extends ApplicationLocalGovernmentDto {
  bceidBusinessGuid: string | null;
  isFirstNation: boolean;
  isActive: boolean;
}
