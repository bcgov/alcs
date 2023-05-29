export interface StaffJournalDto {
  uuid: string;
  body: string;
  author: string;
  edited: boolean;
  createdAt: number;
  isEditable: boolean;
}

export interface CreateStaffJournalDto {
  applicationUuid: string;
  body: string;
}

export interface UpdateStaffJournalDto {
  uuid: string;
  body: string;
}
