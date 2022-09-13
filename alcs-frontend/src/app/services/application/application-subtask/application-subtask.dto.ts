export interface UpdateApplicationSubtaskDto {
  assignee?: string;
  completedAt?: number | null;
}

export interface ApplicationSubtaskDto {
  uuid: string;
  type: string;
  backgroundColor: string;
  textColor: string;
  assignee?: string;
  createdAt: number;
  completedAt?: number;
}
