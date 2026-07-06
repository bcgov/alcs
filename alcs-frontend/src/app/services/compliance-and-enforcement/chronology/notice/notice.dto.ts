import { AllegedActivity } from '../../compliance-and-enforcement.dto';
import { ComplianceAndEnforcementDocumentDto } from '../../documents/document.dto';

export enum NoticeType {
  COMPLIANCE_NOTICE = 'Compliance Notice',
  NOTICE_OF_CONTRAVENTION = 'Notice of Contravention',
  NOTICE_OF_CONSIDERATION_OF_PENALTY = 'Notice of Consideration of Penalty',
  NOTICE_OF_DEBT_COLLECTION = 'Notice of Debt Collection',
}

export enum NotificationMethods {
  EMAIL = 'Email',
  PERSONALLY = 'Personally',
  POSTED_ON_PROPERTY = 'Posted on Property',
  REGISTERED_MAIL = 'Registered Mail',
}

export interface NoticeNotification {
  method: NotificationMethods;
  date: string | null;
}

export interface NoticeDto {
  uuid: string;
  createdAt: number;
  isDraft: boolean;
  date: string | null;
  type: NoticeType | null;
  allegedActivity: AllegedActivity[];
  issuedToIndividualResponsiblePartyUuid: string | null;
  issuedToDirectorUuid: string | null;
  notifications: NoticeNotification[];
  documents: ComplianceAndEnforcementDocumentDto[];
  entryUuid: string;
  dueDates: NoticeDueDateDto[];
}

export interface UpdateNoticeDto {
  isDraft?: boolean;
  date?: string | null;
  type?: NoticeType | null;
  allegedActivity?: AllegedActivity[];
  issuedToIndividualResponsiblePartyUuid?: string | null;
  issuedToDirectorUuid?: string | null;
  notifications?: NoticeNotification[];
  entryFileNumber?: string;
  dueDates?: UpdateNoticeDueDateDto[];
}

export interface NoticeDueDateDto {
  uuid: string;
  noticeUuid: string;
  date: string | null;
  completedDate: number | null;
  comment: string;
}

export interface UpdateNoticeDueDateDto {
  uuid?: string;
  noticeUuid?: string;
  date?: string;
  completedDate?: number | null;
  comment?: string;
}
