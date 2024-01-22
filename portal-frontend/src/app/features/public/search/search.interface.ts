import { ApplicationStatusDto } from '../../../services/application-submission/application-submission.dto';
import { NoticeOfIntentSubmissionStatusDto } from '../../../services/notice-of-intent-submission/notice-of-intent-submission.dto';
import { NotificationSubmissionStatusDto } from '../../../services/notification-submission/notification-submission.dto';

export interface TableChange {
  pageIndex: number;
  itemsPerPage: number;
  sortDirection: string;
  sortField: string;
  tableType: string;
}

export interface SearchResult {
  fileNumber: string;
  dateSubmitted: number;
  ownerName: string;
  type: string;
  localGovernmentName?: string;
  lastUpdate: number;
  portalStatus?: string;
  referenceId: string;
  class: string;
  status?: ApplicationStatusDto | NoticeOfIntentSubmissionStatusDto | NotificationSubmissionStatusDto;
}
