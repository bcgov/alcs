import { UserDto } from '../../../user/user.dto';
import { AllegedActivity } from '../../compliance-and-enforcement.dto';
import { ComplianceAndEnforcementDocumentDto } from '../../documents/document.dto';

export enum InspectionType {
  INITIAL = 'Initial',
  FOLLOW_UP = 'Follow-up',
}

export interface AttendeeDto {
  name: string;
  organization: string;
}

export interface UpdateAttendeeDto {
  name?: string;
  organization?: string;
}

export interface InspectionDto {
  uuid: string;
  createdAt: number;
  isDraft: boolean;
  date: string | null;
  type: InspectionType | null;
  officer: UserDto;
  allegedActivity: AllegedActivity[];
  attendees: AttendeeDto[];
  comments: string;
  documents: ComplianceAndEnforcementDocumentDto[];
  entryUuid: string;
}

export interface UpdateInspectionDto {
  isDraft?: boolean;
  date?: string | null;
  type?: InspectionType | null;
  officerUuid?: string;
  allegedActivity?: AllegedActivity[];
  attendees?: UpdateAttendeeDto[];
  comments?: string;
  entryFileNumber?: string;
}
