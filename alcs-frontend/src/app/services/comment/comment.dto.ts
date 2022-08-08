export interface CommentDto {
  uuid: string;
  body: string;
  author: string;
  edited: boolean;
  createdAt: number;
  isEditable: boolean;
  mentionEmails: string[];
}

export interface CreateCommentDto {
  fileNumber: string;
  body: string;
  mentionsList: string[];
}

export interface UpdateCommentDto {
  uuid: string;
  body: string;
  mentionsList: string[];
}
