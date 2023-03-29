export interface ApplicationStaffJournalDto {
  uuid: string;
  body: string;
  author: string;
  edited: boolean;
  createdAt: number;
  isEditable: boolean;
}

export interface CreateApplicationStaffJournalDto {
  applicationUuid: string;
  body: string;
}

export interface UpdateApplicationStaffJournalDto {
  uuid: string;
  body: string;
}
