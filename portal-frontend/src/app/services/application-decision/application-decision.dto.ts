import { BaseCodeDto } from '../../shared/dto/base.dto';
import { ApplicationDocumentDto } from '../application-document/application-document.dto';

export interface LinkedResolutionDto {
  uuid: string;
  linkedResolutions: string[];
}

export interface PortalDecisionDto {
  uuid: string;
  date: number;
  outcome: BaseCodeDto;
  resolutionNumber: number;
  resolutionYear: number;
  documents: ApplicationDocumentDto[];
  isSubjectToConditions: boolean;
  reconsiders?: LinkedResolutionDto;
  modifies?: LinkedResolutionDto;
}
