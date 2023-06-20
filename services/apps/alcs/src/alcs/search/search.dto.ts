import { ApplicationTypeDto } from '../code/application-code/application-type/application-type.dto';

export class SearchResultDto {
  type: string;
  referenceId: string;
  applicant?: string;
  localGovernmentName: string;
  fileNumber: string;
  boardCode?: string;
  label?: ApplicationTypeDto;
}
