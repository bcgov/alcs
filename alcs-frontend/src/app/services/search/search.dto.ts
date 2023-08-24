import { ApplicationTypeDto } from '../application/application-code.dto';

export interface SearchResultDto {
  fileNumber: string;
  type: string;
  referenceId: string;
  applicant?: string;
  localGovernmentName: string;
  boardCode?: string;
  label?: ApplicationTypeDto;
  ownerName: string;
  dateSubmitted: number;
  portalStatus?: string;
}
