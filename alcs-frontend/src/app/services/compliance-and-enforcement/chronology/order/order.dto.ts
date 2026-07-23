import { AllegedActivity } from '../../compliance-and-enforcement.dto';
import { ComplianceAndEnforcementDocumentDto } from '../../documents/document.dto';

export enum OrderType {
  STOP_WORK_ORDER = 'Stop Work Order',
  PENALTY_ORDER = 'Penalty Order',
  REMEDIATION_ORDER = 'Remediation Order',
  INFORMATION_ORDER = 'Information Order',
  COURT_ORDER = 'Court Order',
}

export enum NotificationMethods {
  EMAIL = 'Email',
  PERSONALLY = 'Personally',
  POSTED_ON_PROPERTY = 'Posted on Property',
  REGISTERED_MAIL = 'Registered Mail',
}

export interface OrderNotification {
  method: NotificationMethods;
  date: string | null;
}

export interface OrderDto {
  uuid: string;
  createdAt: number;
  isDraft: boolean;
  date: string | null;
  type: OrderType | null;
  allegedActivity: AllegedActivity[];
  amount: string | null;
  issuedToIndividualResponsiblePartyUuid: string | null;
  issuedToDirectorUuid: string | null;
  notifications: OrderNotification[];
  documents: ComplianceAndEnforcementDocumentDto[];
  entryUuid: string;
  dueDates: OrderDueDateDto[];
}

export interface UpdateOrderDto {
  isDraft?: boolean;
  date?: string | null;
  type?: OrderType | null;
  allegedActivity?: AllegedActivity[];
  amount?: string | null;
  issuedToIndividualResponsiblePartyUuid?: string | null;
  issuedToDirectorUuid?: string | null;
  notifications?: OrderNotification[];
  entryFileNumber?: string;
  dueDates?: UpdateOrderDueDateDto[];
}

export interface OrderDueDateDto {
  uuid: string;
  noticeUuid: string;
  date: string | null;
  completedDate: number | null;
  comment: string;
}

export interface UpdateOrderDueDateDto {
  uuid?: string;
  noticeUuid?: string;
  date?: string;
  completedDate?: number | null;
  comment?: string;
}
