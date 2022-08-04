export interface CommentDto {
  uuid: string;
  body: string;
  author: string;
  edited: boolean;
  createdAt: number;
  isEditable: boolean;
}

export interface CreateCommentDto {
  fileNumber: string;
  body: string;
}

export interface UpdateCommentDto {
  uuid: string;
  body: string;
}
